cd app
COPYFILE_DISABLE=1 tar -cf ../photos.tar photos
cd ..

#
# List contents, make sure all files are there.
#
tar -tf app/photos.tar > t
wc -l t
