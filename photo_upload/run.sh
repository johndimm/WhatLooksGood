ls ../photos | sort > photos_v0s.txt
mysql < find_new_photos.sql > t
wc -l t
cat t | sed "s/^/cp \~\/yelp_old\/photos_all\//" | sed "s/$/.jpg photos/" > copy_photos.sh
chmod a+x *.sh
wc -l copy_photos.sh
