## Before Started
Here is the list of needed tools or applications. Please make sure you installed all of them before starting the project:
- NodeJS (LTS version 16.17.0)
- MongoDB (version 4.4)

Image files for pre-seed data can be found here: https://drive.google.com/file/d/1yMevhsh5WB-G-oZ33KFO-axBnXHeuJq4/view?usp=sharing\
Please download, extract the file and copy the **uploads** folder to the **[project-root]/api-server/** folder

## Getting Started

First, install all the dependencies needed by running the following commands at the top of the project

```bash
npm install
cd website && npm install
cd api-server && npm install
```

Now the project is ready for starting up. Run the following command at the top of the project to start the project:
```bash
npm start
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

The default credentials are:
- **Admin User:** admin1 / admin2
- **Regular User:** user1 / user2


To access the admin page, open [http://localhost:8080/dashboard](http://localhost:8080/dashboard) with your browser. If logging in with regular user role, you will be redirected to the home page. So make sure you logged in with admin account first.

For email sending functionality, please update your configuration in the .env file (current only supports Gmail)\
- **ADMIN_EMAIL**: Gmail address you want to send mail from
- **ADMIN_EMAIL_APP_PASSWORD**: Google App Password. You can create Google App Password associating with the Gmail above by logging in and then open this address [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (Need to enable 2-step verification first)
