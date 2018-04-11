
drop table if exists business_dish_business;
create table business_dish_business as
    select a.business_id businessa_id, b.dish_id, b.business_id as businessb_id, sum(a.cnt + b.cnt) as cnt
    from business_dish_cnt as a
    join business_dish_cnt as b
      on b.dish_id = a.dish_id
    group by a.business_id, b.business_id
    ;


    
 drop table if exists dish_business_dish;
create table dish_business_dish as
    select a.dish_id as disha_id, b.business_id, b.dish_id as dishb_id, sum(a.cnt + b.cnt) as cnt
    from business_dish_cnt as a
    join business_dish_cnt as b
      on b.business_id = a.business_id
    group by a.dish_id, b.dish_id
    ;

 create index idx_bdb on business_dish_business(businessa_id);
 create index idx_dbd on dish_business_dish(disha_id);