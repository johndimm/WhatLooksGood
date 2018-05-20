#
# Count the number of photos of particular dishes for a business.
#
drop table if exists business_dish_cnt;
create table business_dish_cnt as
select business_id, dish_id, source, count(*) as cnt
from business_dish
group by business_id, dish_id
;

create index idx_bd1 on business_dish_cnt(business_id);
create index idx_bd2 on business_dish_cnt(dish_id);

#
# Count the total number of dish photos for a given business.
#
drop table if exists business_cnt;
create table business_cnt as
select business_id, count(*) as cnt
from business_dish
group by business_id
;

#
# Count the total number of photos and businesses for a given dish.
#
drop table if exists dish_cnt;
create table dish_cnt as
select dish_id, count(*) cnt, count(distinct name) bus_name_cnt
from business_dish as bd
join business as b on b.id = bd.business_id
group by dish_id
order by bus_name_cnt desc
;
