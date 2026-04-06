# TODO

should i remove the delete user route? <- discuss with team <- only allow ROOT_ADMINS

should assign a password when the user is created in the lms.

send that password automatically to the associated email address

a route to allow users to change their own password?

admin panel

X students page

X ----> add new

X ----------> new panel with two options (file, individual) ---> done

admins page

navbar -> login button -> replace with user icon after login

Replace delete user with a disable user feature (as lms shouldn't be the one deciding whether the user exists or not, that; is decided by the central system of the organisation)

## think about the heirarchy again

#### sending a mail to every user created

----> if added 100-200 users and tried sending mails to all of them from lms-mail-id the lms-mail-id can be blacklisted

-----------> use a queue to handle this

  

  

Extends:-

1.  adding pagination and caching using redis for the get all users
2.  a todo-type list that the user can create the hold the book info for that library visit (can use it to store the book locations when going to the actual shelves)
3.  allowing the user to make their own categories of books in MYCOLLECTIONS type things
4. giving the ability to cance operations (maybe using transactions at the backend and rolling back when the user hits Cance <Operation>)