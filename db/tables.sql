#
# Just a list of the core dishes.
#
drop table if exists dish;
create table dish
(
  id int auto_increment primary key,
  dish varchar(255),
  inside_cnt int,
  source enum('exact','substring'),
  index idx_dish(inside_cnt)
);

#
# business -> photo -> dish
#
drop table if exists business_dish;
create table business_dish (
  id int auto_increment primary key,
  business_id varchar(22),
  dish_id int,
  source enum('exact', 'substring'),
  photo_id varchar(22),
  matched bool
);

create index idx_bd1 on business_dish(business_id);
create index idx_bd2 on business_dish(dish_id);