
#
# Find all dishes offered by restaurants that offer sushi.
#

drop procedure if exists dish_reco;
delimiter //
create procedure dish_reco(_dish varchar(255))
begin

    #
    # Gather dishes that contain requested dish.  Could be just one.
    #
    drop temporary table if exists dishes_plus;
    create temporary table dishes_plus like dish;
    insert into dishes_plus
    select *
    from dish
    where locate(_dish, dish) > 0
    order by inside_cnt desc
    limit 20
    ;

    #
    # List the dishes offered by "candidate restaurants", the ones that offer the requested dish.
    #
    drop temporary table if exists reldish;
    create temporary table reldish as
    select db.dish, db.id as dish_id, bd.photo_id, sum(dbd.cnt) as cnt

    # from business_dish_cnt as a
    # join business_dish_cnt as b
    #  on b.business_id = a.business_id

    from dish_business_dish as dbd

    join dishes_plus as da on da.id = dbd.disha_id
    join dish as db on db.id = dbd.dishb_id
    join business_dish as bd on bd.business_id=dbd.business_id and bd.dish_id = dbd.dishb_id
    group by db.dish, db.id
    order by cnt desc
    limit 100;

    #
    # Count the number of photos of those dishes from all restaurants.
    #
    set @global = (
      select sum(dish_cnt.cnt)
      from dish_cnt
      join reldish as r on r.dish_id = dish_cnt.dish_id
    );

    #
    # Count the number of photos of those dishes from candidate restaurants.
    #
    set @local = (
      select sum(cnt)
      from reldish
    );


    #
    # Define a factor to bring the local population in line with the global.
    #
    set @factor = @global / @local;

    #
    # Find dishes disproportionately offered by candidate restaurants.
    #
    select
      _dish, a.dish_id, a.photo_id, d.dish, a.cnt, b.cnt,
      (@factor * a.cnt - b.cnt) / b.cnt as score
    from reldish as a
    join dish_cnt as b on a.dish_id = b.dish_id
    join dish as d on d.id = a.dish_id
    order by score desc
    limit 14;
end //
delimiter ;


#
# Find all dishes offered by restaurants that offer sushi.
#

drop procedure if exists business_reco;
delimiter //
create procedure business_reco(_business_id varchar(22))
begin

    drop temporary table if exists relbus;
    create temporary table relbus as

    # select b.business_id, sum(a.cnt + b.cnt) as cnt
    # from business_dish_cnt as a
    # join business_dish_cnt as b
    #   on b.dish_id = a.dish_id
	# where a.business_id=_business_id
    # group by b.business_id

    select bdb.businessb_id as business_id, sum(bdb.cnt) as cnt
    from business_dish_business as bdb
    where bdb.businessa_id=_business_id
    group by bdb.businessb_id

    order by cnt desc
    limit 100;

    set @global = (
      select sum(business_cnt.cnt)
      from business_cnt
      join relbus as r on r.business_id = business_cnt.business_id
    );

    set @local = (
      select sum(cnt)
      from relbus
    );

    set @factor = @global / @local;

    # select @global, @local, @factor;

    select
      d.name, d.id as business_id, sp.photo_id, a.cnt, b.cnt, (@factor * a.cnt - b.cnt) / b.cnt as score
    from relbus as a
    join business_cnt as b on a.business_id = b.business_id
    #join yelp_db.business as d on d.id = a.business_id
    join business as d on d.id = a.business_id
    join sample_photo as sp on sp.business_id = d.id
    group by d.name
    order by score desc
    limit 14;
end //
delimiter ;



drop procedure if exists dish_search;
delimiter //
create procedure dish_search(_dish varchar(255))
begin
    #
    # Get photos whose captions contain the input dish.
    # Shortest ones first (most likely to be relevant).
    #
    select t.*, bd.photo_id, p.caption
    from
    (
        select b.name as business_name, d.dish, cnt, bdc.business_id, bdc.dish_id, b.stars
        from business_dish_cnt as bdc
        #join yelp_db.business as b on b.id = bdc.business_id
        join business as b on b.id = bdc.business_id
        join dish as d on d.id = bdc.dish_id
        where locate(_dish, d.dish) > 0
        order by length(d.dish)
        limit 100
    ) as t
    join business_dish as bd on bd.business_id=t.business_id and bd.dish_id = t.dish_id
    #join yelp_db.photo as p on p.id = bd.photo_id
    join photo as p on p.id = bd.photo_id
    group by t.business_name, p.caption
    order by length(p.caption), t.stars desc
    ;
end //
delimiter ;

drop procedure if exists dish_sample;
delimiter //
create procedure dish_sample(_dummy varchar(255))
begin
    select *
    from dish_sample
    order by dish;
end //
delimiter ;

drop procedure if exists gen_dish_sample;
delimiter //
create procedure gen_dish_sample()
begin

    drop table if exists stopwords;
    create table stopwords
    (
      word varchar(255)
    );
    insert into stopwords
    (word)
    values ('Lunch'), ('Food'), ('Amazing'), ('Decor'), ('Platter'),
		  ('So good'), ('Tasty'), ('Yum'), ('Nice'), ('menu'), ('Mmmm'),
		  ('good'), ('club'), ('Dinner'), ('great food');

  drop temporary table if exists dish_exact;
  create temporary table dish_exact as
    select t.dish, t.dish_id, min(t.business_id) as business_id,
      min(photo_id) as photo_id, count(*) as cnt
    from (
        select d.dish, d.id as dish_id, b.name, min(b.id) as business_id
        from dish as d
        join business_dish_cnt as bdc on bdc.dish_id = d.id
        join business as b on b.id=bdc.business_id
        join business_dish as bd on bd.dish_id=bdc.dish_id and bd.business_id = bdc.business_id
        # left join stopwords on stopwords.word = d.dish
        where d.source = 'exact'
        # and stopwords.word is null
        and matched = 1
		and locate('website', d.dish) = 0
		and locate('Yum', d.dish) != 1
        group by b.name
    ) as t
	join business_dish as bd on bd.business_id=t.business_id and bd.dish_id = t.dish_id
    group by t.dish_id
    having cnt > 8
    order by cnt desc
    ;

  select count(distinct business_id) from dish_exact;

  drop table if exists dish_sample;
  create table dish_sample as
  select
    de.dish, de.dish_id, de.business_id, de.photo_id,
    p.caption, b.name as business_name, b.stars
  from dish_exact as de
  join photo as p on p.id=de.photo_id
  join business as b on b.id=de.business_id
  order by de.dish
  ;
end //
delimiter ;

drop procedure if exists business_dishes;
delimiter //
create procedure business_dishes(_business_id varchar(22))
begin
  select d.dish, bd.dish_id, bd.photo_id,
    caption, b.name as business_name, b.id as business_id, b.stars
  from business_dish as bd
  #join yelp_db.business as b on b.id = bd.business_id
  join business as b on b.id = bd.business_id
  join dish as d on d.id = bd.dish_id
  #join yelp_db.photo as p on p.id = bd.photo_id
  join photo as p on p.id = bd.photo_id
  where bd.business_id = _business_id
  group by bd.photo_id
  ;

end //
delimiter ;

drop procedure if exists business_info;
delimiter //
create procedure business_info(_business_id varchar(22))
begin
  #select * from yelp_db.business where id = _business_id
  select * from business where id = _business_id
  ;
end //
delimiter ;

drop procedure if exists dishes;
delimiter //
create procedure dishes(_dummy int)
begin
  #
  # Show all dishes, but filter out the ones starting with $ or a number.
  #
  select dish
  from dish
  where dish >= "A"
  order by dish;
end //
delimiter ;
