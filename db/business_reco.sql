#
# Create tables to store the recommendations.
#

drop table if exists business_dish_business;
create table business_dish_business
(
  businessa_id varchar(22),
  dish_id int,
  businessb_id varchar(22),
  cnt int
);

drop procedure if exists bdb_gen;
delimiter //
create procedure bdb_gen()
begin

  DECLARE _business_id varchar(22);
  DECLARE done INT DEFAULT 0;

  DECLARE ft_cursor CURSOR FOR
    select distinct(business_id) as business_id
    from business_dish
    #limit 1000
    ;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN ft_cursor;
  read_loop: LOOP
    FETCH ft_cursor INTO _business_id;

    IF done THEN
    LEAVE read_loop;
    END IF;

    insert into business_dish_business
	(businessa_id, dish_id, businessb_id, cnt)
	select a.business_id businessa_id, b.dish_id, b.business_id as businessb_id, sum(a.cnt + b.cnt) as cnt
    from business_dish_cnt as a
    join business_dish_cnt as b
      on b.dish_id = a.dish_id
	where a.business_id = _business_id
    group by a.business_id, b.business_id
    order by cnt desc
    limit 50 
    ;

  END LOOP;
  CLOSE ft_cursor;
end//
delimiter ;

call bdb_gen();
