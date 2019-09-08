# CS50 Final Project - Homework framework

The project is a webpage where teachers can create assignments for students. The implementation is fairly simple, to keep the project scope in check. I wanted to make a project like this to expand my knowledge of Node JS and of techniques like buffer piping from database to client, role based authentications, etc.

Technologies used:

- Node JS
- Express JS
- bcryptjs
- passport
- sqlite3
- ejs
- other small libraries or packages

## How the webpage works?

The idea is simple. The user can register either as student or teacher. During registration you need to enter these fields:

- Email
- Name
- Password: it is checked to match, must be at least 6 symbols long and is hashed after checks are done
- Checkbox for what type of user you will be (student or teacher)

Student registration allows you to access student dashboard, where you cna see created homeworks. Entering the homework you can upload a file. Once the teacher grades and reviews your submission it will appear instead of <input type="file">.

For teachers teacher dashboard is unlocked, where they can create a homework and see student's which submitted homework. When accessing the homework, teacher can download the submitted file and then write a review and grade it.

### Routing

Each route checks if the user is authenticated. It means if correct mail and password were supplied and what role it has. So for example a teacher cannot enter /students/homeworks/1 route. The same is for student, he cannot enter teacher dashboard route.

### Sessions

The webpage uses sessions to confirm that user is registered. Once the user logins, his credentials are checked with bcrypt and Passport JS library. Once everything passes a session is created (serialized and deserialized) and stored in the cookies. The server attaches user to subsequent requests, so the back-end can easily access the details, like roles: student, teacher.

### Database

Database stores all users, homeworks, student submissions. The tables, like student submissions uses foreign keys to relate users to submitted homework. Moreover, homeworks table uses foreign keys to relate the homework to a teacher.

## Possible improvements

As all applications this one can also be improved. Possible imprevements:

- Have administrator account which confirms user identity, so that student could not register as a teacher
- Ability to change account details
- Have a way for teacher to upload videos to explain the assignment
