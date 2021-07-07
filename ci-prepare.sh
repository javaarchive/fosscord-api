echo "Installing mongodb via tar"
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.4.6.tgz
tar -xzvf mongodb-linux-x86_64-ubuntu1804-4.4.6.tgz
ls
cp mongodb-linux-x86_64-ubuntu1804-4.4.6/bin/mongod mongod
cp mongodb-linux-x86_64-ubuntu1804-4.4.6/bin/mongo mongo
chmod +x mongod
chmod +x mongo
