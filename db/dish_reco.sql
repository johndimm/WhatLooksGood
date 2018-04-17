
drop table if exists dish_business_dish;
create table dish_business_dish
(
  disha_id int,
  business_id varchar(22),
  dishb_id int,
  cnt int
);

drop procedure if exists dbd_gen;
delimiter //
create procedure dbd_gen()
begin

  DECLARE _dish_id varchar(22);
  DECLARE done INT DEFAULT 0;

  DECLARE ft_cursor CURSOR FOR
    select distinct(dish_id) as dish_id
    from business_dish
    #limit 10
    ;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN ft_cursor;
  read_loop: LOOP
    FETCH ft_cursor INTO _dish_id;

    IF done THEN
    LEAVE read_loop;
    END IF;

    insert into dish_business_dish
	(disha_id, business_id, dishb_id, cnt)
    select a.dish_id as disha_id, b.business_id, b.dish_id as dishb_id, sum(a.cnt + b.cnt) as cnt
    from business_dish_cnt as a
    join business_dish_cnt as b
      on b.business_id = a.business_id
	where a.dish_id=_dish_id
    group by a.dish_id, b.dish_id
    order by cnt desc
    limit 100
    ;

  END LOOP;
  CLOSE ft_cursor;
end//
delimiter ;

call dbd_gen();

 create index idx_bdb on business_dish_business(businessa_id);
 create index idx_dbd on dish_business_dish(disha_id);
