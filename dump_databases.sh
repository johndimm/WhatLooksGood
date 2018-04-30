#
# doteasy has a 50M limit on imported sql files,
# so split into multiple dumps.
#

mysqldump --routines yelp_db_caption  \
business \
business_cnt \
business_dish \
business_dish_cnt \
> yelp_db_caption.sql 

mysqldump --routines yelp_db_caption  \
dish_business_dish \
dish \
dish_cnt \
food_phrases \
photo \
restaurant \
singleton_phrase \
total_caption \
words \
> yelp_db_caption2.sql 

mysqldump --routines yelp_db_caption  \
business_dish_business \
sample_photo \
dish_sample \
> yelp_db_caption3.sql

cat yelp_db_caption.sql | sed "s/ DEFINER=\`accuscore\`@\`localhost\`//" > db1.sql
cat yelp_db_caption2.sql | sed "s/ DEFINER=\`accuscore\`@\`localhost\`//" > db2.sql
cat yelp_db_caption3.sql | sed "s/ DEFINER=\`accuscore\`@\`localhost\`//" > db3.sql
 
rm yelp_db_caption.sql
rm yelp_db_caption2.sql
rm yelp_db_caption3.sql
