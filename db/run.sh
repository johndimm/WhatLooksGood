# Create tables.
mysql < tables.sql

# Import from yelp captions.
./import_yelp.sh

# Create count tables.
./build.sh