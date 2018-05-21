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
