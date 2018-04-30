COPYFILE_DISABLE=1 tar -cf photos.tar photos

#
# List contents, make sure all files are there.
#
tar -tf photos.tar > t
wc -l t
