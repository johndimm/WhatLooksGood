
drop table if exists food_phrases;
create table food_phrases as
select caption, sum(cnt) as num_photos, count(*) as cnt
from
(
    select b.name, cleanDish(word) as caption, count(*) as cnt
    from words
    join yelp_db.business as b on b.id=words.business_id
    group by b.name, caption
    having cnt = 1
) as t
where  length(caption) > 2
and length(caption) - length(replace(caption, ' ','')) < 3
group by caption
having cnt > 1
order by cnt desc
;

drop table if exists singleton_phrase; 
drop table if exists singled_phrase;
create table singleton_phrase as
select fp.*
from food_phrases as fp
left join total_caption as tc on tc.caption = fp.caption
where tc.caption is null
;
