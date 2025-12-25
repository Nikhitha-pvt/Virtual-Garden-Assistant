<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Garden.php';
require_once __DIR__ . '/models/Plant.php';
require_once __DIR__ . '/models/Task.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);
$endpoint = $uri[2] ?? ''; // Assuming the API is at /api/
$method = $_SERVER['REQUEST_METHOD'];

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

try {
    switch($endpoint) {
        case 'users':
            $user = new User();
            switch($method) {
                case 'POST':
                    $user->username = $data->username;
                    $user->email = $data->email;
                    $user->password = $data->password;
                    if($user->create()) {
                        http_response_code(201);
                        echo json_encode(["message" => "User created successfully."]);
                    } else {
                        http_response_code(503);
                        echo json_encode(["message" => "Unable to create user."]);
                    }
                    break;
                case 'GET':
                    if(isset($uri[3])) {
                        $result = $user->findById($uri[3]);
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "User ID required."]);
                        exit();
                    }
                    if($result) {
                        http_response_code(200);
                        echo json_encode($result);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "User not found."]);
                    }
                    break;
            }
            break;

        case 'gardens':
            $garden = new Garden();
            switch($method) {
                case 'POST':
                    $garden->user_id = $data->user_id;
                    $garden->name = $data->name;
                    $garden->location = $data->location;
                    $garden->size = $data->size;
                    $garden->description = $data->description;
                    if($gardenId = $garden->create()) {
                        http_response_code(201);
                        echo json_encode(["message" => "Garden created successfully.", "id" => $gardenId]);
                    } else {
                        http_response_code(503);
                        echo json_encode(["message" => "Unable to create garden."]);
                    }
                    break;
                case 'GET':
                    if(isset($uri[3])) {
                        $result = $garden->findById($uri[3]);
                        if($result) {
                            $stats = $garden->getGardenStats($uri[3]);
                            $result['stats'] = $stats;
                        }
                    } else {
                        $result = $garden->findByUserId($data->user_id);
                    }
                    if($result) {
                        http_response_code(200);
                        echo json_encode($result);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "Garden not found."]);
                    }
                    break;
                case 'PUT':
                    if(isset($uri[3])) {
                        $garden->id = $uri[3];
                        $garden->name = $data->name;
                        $garden->location = $data->location;
                        $garden->size = $data->size;
                        $garden->description = $data->description;
                        if($result = $garden->update()) {
                            http_response_code(200);
                            echo json_encode($result);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to update garden."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Garden ID required."]);
                    }
                    break;
                case 'DELETE':
                    if(isset($uri[3])) {
                        if($garden->delete($uri[3])) {
                            http_response_code(200);
                            echo json_encode(["message" => "Garden deleted successfully."]);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to delete garden."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Garden ID required."]);
                    }
                    break;
            }
            break;

        case 'plants':
            $plant = new Plant();
            switch($method) {
                case 'POST':
                    $plant->garden_id = $data->garden_id;
                    $plant->name = $data->name;
                    $plant->species = $data->species;
                    $plant->planting_date = $data->planting_date;
                    $plant->watering_frequency = $data->watering_frequency;
                    $plant->sunlight_needs = $data->sunlight_needs;
                    $plant->notes = $data->notes;
                    if($plantId = $plant->create()) {
                        http_response_code(201);
                        echo json_encode(["message" => "Plant created successfully.", "id" => $plantId]);
                    } else {
                        http_response_code(503);
                        echo json_encode(["message" => "Unable to create plant."]);
                    }
                    break;
                case 'GET':
                    if(isset($uri[3])) {
                        $result = $plant->findById($uri[3]);
                    } else {
                        $result = $plant->findByGardenId($data->garden_id);
                    }
                    if($result) {
                        http_response_code(200);
                        echo json_encode($result);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "Plant not found."]);
                    }
                    break;
                case 'PUT':
                    if(isset($uri[3])) {
                        $plant->id = $uri[3];
                        $plant->name = $data->name;
                        $plant->species = $data->species;
                        $plant->planting_date = $data->planting_date;
                        $plant->watering_frequency = $data->watering_frequency;
                        $plant->sunlight_needs = $data->sunlight_needs;
                        $plant->notes = $data->notes;
                        if($result = $plant->update()) {
                            http_response_code(200);
                            echo json_encode($result);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to update plant."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Plant ID required."]);
                    }
                    break;
                case 'DELETE':
                    if(isset($uri[3])) {
                        if($plant->delete($uri[3])) {
                            http_response_code(200);
                            echo json_encode(["message" => "Plant deleted successfully."]);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to delete plant."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Plant ID required."]);
                    }
                    break;
            }
            break;

        case 'tasks':
            $task = new Task();
            switch($method) {
                case 'POST':
                    $task->garden_id = $data->garden_id;
                    $task->title = $data->title;
                    $task->description = $data->description;
                    $task->due_date = $data->due_date;
                    $task->status = $data->status;
                    if($taskId = $task->create()) {
                        http_response_code(201);
                        echo json_encode(["message" => "Task created successfully.", "id" => $taskId]);
                    } else {
                        http_response_code(503);
                        echo json_encode(["message" => "Unable to create task."]);
                    }
                    break;
                case 'GET':
                    if(isset($uri[3])) {
                        $result = $task->findById($uri[3]);
                    } else {
                        $result = $task->findByGardenId($data->garden_id);
                    }
                    if($result) {
                        http_response_code(200);
                        echo json_encode($result);
                    } else {
                        http_response_code(404);
                        echo json_encode(["message" => "Task not found."]);
                    }
                    break;
                case 'PUT':
                    if(isset($uri[3])) {
                        $task->id = $uri[3];
                        $task->title = $data->title;
                        $task->description = $data->description;
                        $task->due_date = $data->due_date;
                        $task->status = $data->status;
                        if($result = $task->update()) {
                            http_response_code(200);
                            echo json_encode($result);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to update task."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Task ID required."]);
                    }
                    break;
                case 'DELETE':
                    if(isset($uri[3])) {
                        if($task->delete($uri[3])) {
                            http_response_code(200);
                            echo json_encode(["message" => "Task deleted successfully."]);
                        } else {
                            http_response_code(503);
                            echo json_encode(["message" => "Unable to delete task."]);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode(["message" => "Task ID required."]);
                    }
                    break;
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(["message" => "Endpoint not found."]);
            break;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Internal server error: " . $e->getMessage()]);
} 