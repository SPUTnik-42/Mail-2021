document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-header').style.display = 'none';
  document.querySelector('#emails-table').style.display = 'none';
  document.querySelector("#emails-view").style.display = 'none' ;
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-header').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-table').style.display = 'block';
  document.querySelector("#emails-view").style.display = 'none' ;
 
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // ... do something else with emails ...
     
      var col = [];
      for (var i = 0; i < emails.length; i++) {
        for (var key in emails[i]) {
          if (col.indexOf(key) === -1) {
            col.push(key);
          }
        }
      }
      console.log(col)
      // CREATE DYNAMIC TABLE.
      var table = document.createElement("table");

      // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

      var tr = table.insertRow(-1);                   // TABLE ROW.
      tr.style = "text-align: center; padding: 80px; border-collapse : collapse;"

      for (var i = 1; i < col.length; i++) {
          var th = document.createElement("th");  // TABLE HEADER.
          if (mailbox === 'inbox' || mailbox === "archive"){
            if (col[i] === "sender" || col[i] === "subject" || col[i] === "timestamp"){
           
              th.innerHTML = col[i].toUpperCase();
              tr.appendChild(th);
            }
          }
          if (mailbox === "sent"){
            if (col[i] === "recipients" || col[i] === "subject" || col[i] === "timestamp"){
           
              th.innerHTML = col[i].toUpperCase();
              tr.appendChild(th);
            }
          }
          if (mailbox === "archive"){
            if (col[i] === "sender" || col[i] === "subject" || col[i] === "timestamp" || col[i] === "archived"){
           
              th.innerHTML = col[i].toUpperCase();
              tr.appendChild(th);
            }
          }

      }

      // ADD JSON DATA TO THE TABLE AS ROWS.
      for (var i = 0; i < emails.length; i++) {

        tr = table.insertRow(-1);
        tr.setAttribute('id', `row${i}`)
        
        for (var j = 0; j < col.length; j++) {
            
            if ( mailbox ===  "inbox" ){
              if (col[j] === "sender" || col[j] === "subject" || col[j] === "timestamp" ) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = emails[i][col[j]];
                tabCell.setAttribute('id', col[j]) ;
                tabCell.style = "text-align: center; padding: 80px; border-collapse : collapse;" ;
                var id = emails[i][col[0]] ;
                tabCell.addEventListener('click', () => read_email(id,mailbox)) ;
              
              }
            }
            if (mailbox === "sent"){
              if (col[j] === "recipients" || col[j] === "subject" || col[j] === "timestamp" ) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = emails[i][col[j]];
                tabCell.setAttribute('id', col[j]) ;
                tabCell.style = "text-align: center; padding: 80px; border-collapse : collapse;" ;
                var id = emails[i][col[0]] ;
                tabCell.addEventListener('click', () => read_email(id,mailbox)) ;
                
              
              }
            }

            if (mailbox === "archive"){
              if (col[j] === "sender" || col[j] === "subject" || col[j] === "timestamp" || col[j] == "archived" ) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = emails[i][col[j]];
                tabCell.setAttribute('id', col[j]) ;
                tabCell.style = "text-align: center; padding: 80px; border-collapse : collapse;" ;
                var id = emails[i][col[0]] ;
                tabCell.addEventListener('click', () => read_email(id,mailbox)) ;
              
              }
              console.log(mailbox);
            }

            if ( col[j] === "read" & emails[i][col[j]] === true){
              tr.style.backgroundColor = "#c2e4f0" ;
            }
            if ( col[j] === "read" & emails[i][col[j]] === false){
              tr.style.backgroundColor = "#c8cbcc" ;
            }
        }
      }

      // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
      var divContainer = document.getElementById("emails-table");
      divContainer.innerHTML = "";
      divContainer.appendChild(table);
  });
}

function archive_email(email_id, to_archive) {
  fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: to_archive 
      })
  }).then( () => load_mailbox("inbox"));

}

function send_email(event) {
  // Modifies the default beheavor so it doesn't reload the page after submitting.
  event.preventDefault();

  
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

 
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    // Take the return data and parse it in JSON format.
    .then((response) => response.json())
    .then((result) => {
      alert(result['message']);
      console.log(result);
    })
    .catch((error) => console.log(error));
  compose_email()

}
/*
function load_email(email_id, origin_mailbox) {
  document.querySelector('#emails-table').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  document.querySelector('#emails-view').innerHTML= '';


  fetch(`/emails/${email_id}`)
      .then(response => response.json())
      .then(email => {
          if ("error" in email) {console.log(email)}
          var col = ["subject", "timestamp", "sender", "recipients", "body"];

          col.forEach(email_element => {
            const div_row = document.createElement('div');
            div_row.classList.add("row", `email-${email_element}-section`);
            if (email_element === "subject") {
                // For the subject, I want to have the subject section but also two buttons on the right side
                // for replying and archiving

                //first the subject section
                const div_col_subject = document.createElement('div');
                div_col_subject.classList.add("col-8");
                div_col_subject.id = "email-subject-subsection";
                div_col_subject.innerHTML  = `<p>${email[email_element]}</p>`;
                div_row.append(div_col_subject);

                // Now a section for the two buttons
                const div_col_reply_archive = document.createElement('div');
                div_col_reply_archive.classList.add("col-4");
                div_col_reply_archive.id="archive-reply-button";
                const data_for_potential_buttons_to_add = [
                    ["Reply", () => reply_email(email)], // a reply button
                    [email["archived"] ? "Unarchive" : "Archive",
                        () => archive_email(email_id, !email["archived"] )] // Archive button
                ];

                // if the mailbox we came from was "sent" mailbox, then we actually don't need the archive button
                (origin_mailbox === "sent" ?
                    data_for_potential_buttons_to_add.slice(0,1) : data_for_potential_buttons_to_add)
                .forEach( text_function => {
                    const text = text_function[0];
                    const callback_func = text_function[1];
                    const button = document.createElement("button");
                    button.classList.add("float-right");
                    button.innerHTML = text;
                    button.addEventListener('click', callback_func);
                    div_col_reply_archive.append(button);
                });
                div_row.append(div_col_reply_archive);

            }
            else {
                div_row.innerHTML = `<p>${email[email_element]}</p>`;
            }

            document.querySelector("#single-email-content").append(div_row);
        });
        const back_button_row_div = document.createElement('div');
        back_button_row_div.classList.add("row");
        const back_button_col_div = document.createElement('div');
        back_button_col_div.classList.add("col-2", "offset-5");
        back_button_col_div.id = "back-button";
        back_button_col_div.innerHTML =
            `<p>${origin_mailbox.charAt(0).toUpperCase() + origin_mailbox.slice(1)}</p>`;
        back_button_col_div.addEventListener('click', () => load_mailbox(origin_mailbox));
        back_button_row_div.append(back_button_col_div);
        document.querySelector("#single-email-back-section").append(back_button_row_div);


    })
      .catch(error =>console.log(error));


  fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
  }).then();
}
*/
function read_email(id,parent_mailbox) {
  document.querySelector("#emails-table").style.display = "none";
  document.querySelector("#emails-view").style.display = "block";

  // Erase any email that was here
  document.querySelector("#emails-view").innerHTML = "";

  // Get the email's info and build the section.
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(result => {
      build_email(result, parent_mailbox);
    })
    .catch(error => console.log(error));

  // Set the email to read.
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  });
}

function build_email(data,parent_mailbox) {
  const from = document.createElement("div");
  const to = document.createElement("div");
  const subject = document.createElement("div");
  const timestamp = document.createElement("div");
  const reply_button = document.createElement("button");
  const archive_button = document.createElement("button");
  const body = document.createElement("div");

  from.innerHTML = `<strong>From: </strong> ${data["sender"]}`;
  to.innerHTML = `<strong>To: </strong> ${data["recipients"].join(", ")}`;
  subject.innerHTML = `<strong>Subject: </strong> ${data["subject"]}`;
  timestamp.innerHTML = `<strong>Timestamp: </strong> ${data["timestamp"]}`;
  body.innerHTML = data["body"];

  // * Archive button
  if (parent_mailbox === "inbox" || parent_mailbox === "archive"){
    archive_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>  ';
    if (data["archived"]) {
      archive_button.innerHTML += "Unarchive";
    } else {
      archive_button.innerHTML += "Archive";
    }
    archive_button.classList = "btn btn-outline-primary m-2";
    archive_button.addEventListener("click", () => {
      archive_email(data);
      load_mailbox("inbox");
    });
    document.querySelector("#emails-view").appendChild(archive_button);
  }
  

  // * Reply button
  reply_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
  reply_button.classList = "btn btn-outline-primary m-2";
  reply_button.addEventListener("click", () => compose_reply(data));

  document.querySelector("#emails-view").appendChild(from);
  document.querySelector("#emails-view").appendChild(to);
  document.querySelector("#emails-view").appendChild(subject);
  document.querySelector("#emails-view").appendChild(timestamp);
  
  document.querySelector("#emails-view").appendChild(reply_button);
  document.querySelector("#emails-view").appendChild(document.createElement("hr"));
  document.querySelector("#emails-view").appendChild(body);
}

/**
 * Toggles the archive status of an email.
 * @param {JSON} data The data of a certain email
 */
function archive_email(data) {
  fetch(`/emails/${data["id"]}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !data["archived"]
    })
  });
}

function compose_reply(data) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#emails-table").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = data["sender"];
  document.querySelector("#compose-subject").value = ((data["subject"].match(/^(Re:)\s/)) ? data["subject"] : "Re: " + data["subject"]);
  document.querySelector("#compose-body").value = `On ${data["timestamp"]} ${data["sender"]} wrote:\n${data["body"]}\n-------------------------------------\n`;
}