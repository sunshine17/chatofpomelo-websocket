dir=${0%/*}
cd $dir
pomelo stop > /dev/null 2>&1 
pomelo start --daemon > /dev/null 2>&1 &
pomelo list
