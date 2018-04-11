<?php
 
function getParam($paramName, $defaultValue) {
    return (isset($_GET[$paramName])) ?  $_GET[$paramName] : $defaultValue;
}

function printJSON($db, $sql) {
  // Performing SQL query
  $result = dbGet($db, $sql);

  header('Content-type: application/json');
  header('Access-Control-Allow-Origin: *');
  // echo dump($result);
  echo json_encode($result);
}

function xdbInit() {
    $mysql_host = "localhost";
    $mysql_user = "johndimm_mysql";
    $mysql_password = "Jfkdls92";
    $mysql_database = "johndimm_olympics";

    $mysql_host = "localhost";
    $mysql_user = "accuscore";
    $mysql_password = "accuscore2drive";
    $mysql_database = "yelp_db";

    // Connecting, selecting database
    $db = mysql_connect($mysql_host, $mysql_user, $mysql_password)
        or die('Could not connect: ' . mysql_error());
    mysql_select_db($mysql_database) or die('Could not select database');
    mysql_set_charset('utf8',$db);
    return $db;
}

function main() {
//  echo '[{"url":"http://www.johndimm.com/photos/2014/10/IMG_20141019_133156.jpg", "caption":"", "rating":"good", "rotation":0}]';
//  return;

  include "db.php";
  $db = dbInit();

  $sql = '';
  $dish = getParam('dish', "beef");
  $proc = getParam('proc', 'business_reco');
  $business_id = getParam('business_id', '');
  $param = $business_id == '' ? $dish : $business_id;

  $sql = "call $proc('$param')";
  printJSON($db, $sql);
  #echo $sql;
}

main();

?>
  

