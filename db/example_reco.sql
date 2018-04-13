# 
# This file is used to generate the data for 
# the explanation of recommendations in the doc.
#
# Not used by the actual product.
#

 use yelp_db_caption;
 
 #
 # Find some dishes that are offered by only three restaurants.
 #
 select dish, dish_id, count(*) as cnt
 from business_dish as bd
 join dish as d on d.id=bd.dish_id
 group by dish_id
 having cnt = 3
 limit 20
 ;
 
 #
 # Pick one.
 #
 set @dish_id=827; # 928;  # cauliflower steak
 
 #
 # What are the three restaurants?
 #
 drop temporary table if exists three_restaurants;
 create temporary table three_restaurants as
 select b.id as business_id, b.name
 from business_dish as bd
 join business as b on b.id=bd.business_id
 where dish_id=@dish_id
 ;
 select name from three_restaurants;
 
 #
 # What are the dishes offered by these three restaurants?
 #
 drop temporary table if exists related_dish;
 create temporary table related_dish as
 select bd.dish_id, d.dish, count(*) as cnt
 from three_restaurants as tr
 join business_dish as bd on bd.business_id = tr.business_id
 join dish as d on d.id=bd.dish_id
 group by dish_id
 order by cnt desc
 ;
 select dish, cnt from related_dish;
 
 #
 # Get global counts.
 #
 drop temporary table if exists related_dish_cnt;
 create temporary table related_dish_cnt as
 select rd.dish, rd.cnt as local_count, dc.cnt as global_count
 from related_dish as rd
 join dish_cnt as dc on dc.dish_id=rd.dish_id
 ;
 select * from related_dish_cnt
 order by local_count desc;
 
 #
 # Normalie local counts so they can be compared to global counts.
 #
 set @local_total = (select sum(local_count) from related_dish_cnt);
 set @global_total = (select sum(global_count) from related_dish_cnt);
 set @factor = @global_total / @local_total;
 
 drop temporary table if exists normalized;
 create temporary table normalized as
 select dish, local_count, global_count, round(local_count * @factor) as normalized_local_count
 from related_dish_cnt;
 select * from normalized
 order by normalized_local_count desc;
 
 #
 # Find disproportionately represented dishes.
 #
 select dish, (normalized_local_count - global_count) / global_count as score
 from normalized
 order by (normalized_local_count - global_count) / global_count desc;

  

