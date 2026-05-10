# EECS447_Project

Welcome to my course project for EECS 447: Introduction to Database Systems. 

This project is split into three main parts. 

The first is the client web app. This is what the user interacts with and is hosted at the GitHub pages site
for this repository: https://bribedjupiter.github.io/EECS447_Project/. See the KULE folder for more details. If you
would like to run it yourself, run `npm install` in the KULE folder, followed by `npx expo start`. 

The second is the remote server that the client connects to. This is located in the API folder. It serves as the intermediary 
between the client and the database. If you would like to run it yourself, run `pip install -r requirements.txt` in the API folder
followed by `python server.py`. Don't forget to point the client to the server by changing the API_URL in KULE/utils/api.ts. 

The third part is the AWS Database that the server communicates with. It's important to note that after the Spring 2026 semester ends, 
both the database and the remote server will be shut down. 
