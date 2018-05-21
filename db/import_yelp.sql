#
#  Combined whole captions with singleton phrases.
#  Use only multi-word singletons, to avoid a lot of noise.
#
insert into dish
(dish, source, inside_cnt)
select caption as dish, 'exact' as source, inside_cnt
from total_caption
union
select caption as dish, 'substring' as source, 1 as inside_cnt
from singleton_phrase
where length(caption) > 3
and length(caption) - length(replace(caption,' ', '')) > 0
;

#
# Remove plurals where singular is found.
# If we have both tacos and taco, keep only taco, 
# since it will match tacos in captions.
#
SET SQL_SAFE_UPDATES = 0;
delete dish from dish
join (
select a.dish as adish, b.dish as bdish, b.id as bid
from dish as a
join dish as b on
b.dish = concat(a.dish, 's')
) as t on t.bid = dish.id
;

#
# Find all captions that contain a dish.
# The dish text needs to be at the start, or after a space.
# Too bad mysql does not do regex.
#
insert into business_dish
(business_id, dish_id, source, photo_id, matched)
select
  business_id, dish.id as dish_id, dish.source, photo.id as photo_id,
  (dish.dish = photo.caption) as matched
from dish
join photo on (
  locate(dish.dish, photo.caption) = 1
  or locate(concat(' ',dish.dish), photo.caption) > 0
)
;



