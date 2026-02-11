docker run --name cab-mysql ^
  -e MYSQL_ROOT_PASSWORD=root ^
  -e MYSQL_DATABASE=cab_service_db ^
  -p 3306:3306 ^
  -d mysql:8.0
