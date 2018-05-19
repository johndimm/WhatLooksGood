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
  

