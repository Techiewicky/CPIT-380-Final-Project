import requests

def send_image_to_endpoint(image_path, endpoint):
    # Ensure the correct endpoint path is used
    url = f"http://127.0.0.1:5000/predict/{endpoint}"  # Updated to include the /predict/ prefix
    with open(image_path, 'rb') as img_file:
        files = {'file': img_file}
        response = requests.post(url, files=files)
        
        # Print the raw response content for debugging purposes
        print("Response status code:", response.status_code)
        print("Response content:", response.text)

        # Try to parse the response as JSON
        try:
            return response.json()
        except requests.exceptions.JSONDecodeError:
            print("Failed to parse JSON response")
            return None

if __name__ == "__main__":
    # Example paths to images for each class
    image_path = r"C:\Users\User\Desktop\BrAInProject\BrAInProject\Dataset\cancer\glioma_tumor\image(1).jpg"

    # Sending images to each endpoint
 #   ms_result = send_image_to_endpoint(image_path, 'ms')
    cancer_result = send_image_to_endpoint(image_path, 'cancer')
   # alzheimer_result = send_image_to_endpoint(image_path, 'alzheimer')
    print("MS Prediction:", cancer_result)
