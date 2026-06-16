<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$file = __DIR__ . '/../data/orders.json';

function readOrders($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?? [];
}

function writeOrders($file, $orders) {
    file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode(readOrders($file));

} elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $orders = readOrders($file);
    array_unshift($orders, $body);
    writeOrders($file, $orders);
    echo json_encode(['success' => true, 'order' => $body]);

} elseif ($method === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    $orders = readOrders($file);
    foreach ($orders as &$o) {
        if ($o['id'] == $body['id']) {
            $o['status'] = $body['status'];
            break;
        }
    }
    writeOrders($file, $orders);
    echo json_encode(['success' => true]);

} elseif ($method === 'DELETE') {
    writeOrders($file, []);
    echo json_encode(['success' => true]);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
