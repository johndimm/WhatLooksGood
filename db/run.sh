# Dump yelp photo captions.
#mysql yelp_db < get_captions.sql > captions.txt

# Grab the two tables we need from the yelp dataset challenge.
#mysqldump yelp_db business photo > business_photo.sql
#mysql < business_photo.sql

# Exact match of the complete caption.
mysql < total_caption.sql

# Extract noun phrases.
python phrases.py captions.txt > words.txt
mysql < load.sql

# Find phrases that are the only phrase in many captions.
mysql < singleton_phrase.sql

# Create tables.
mysql < tables.sql

# Create dish, count tables.
mysql < dish.sql

# Generate some counts.
mysql < count.sql

# Stored procedures for retrieval.
mysql < reco.sql

# Get a sample dish for each business.
mysql < sample_photo.sql

# Generate recommendations tables.
mysql < dish_reco.sql
mysql < business_reco.sql

# Create the list of dishes for the home page.
mysql -e "call gen_dish_sample()";
