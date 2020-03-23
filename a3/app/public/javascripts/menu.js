var shownGraph = false;
var shownTable = false;


//This function will handle the default event whenever using a submit button to submit a form
function handleSubmit(event) {
    event.preventDefault();
}


//Parses time string to float
//Reference: https://stackoverflow.com/questions/10893613/how-can-i-convert-time-to-decimal-number-in-javascript
//ex: 5:00 is 5, 5:30 is 5.5
function timeStringToFloat(time) 
{
    var hoursMinutes = time.split(/[.:]/);
    var hours = parseInt(hoursMinutes[0], 10);
    var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return hours + minutes / 60;
}

//Parses float to time string
//ex: 5.5 is 5:30
function floatToTimeString(float)
{
    var timeString = float.toString();
    var hoursMinutes = timeString.split(".");
    var hours = parseInt(hoursMinutes[0], 10);
    var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) * 0.6 : 0;
    if(!hoursMinutes[1])
    {
        return hours.toString() + ":00";
    }else if(hoursMinutes[1] == "30")
    {
        return hours.toString() + ":30";
    }
    return hours.toString() + ":" + minutes.toString();
}

function populateTable()
{
    var table = document.querySelector('#table');

    if(shownTable == true)
    {
        console.log("already shown table");
        return;
    }

    fetch("http://localhost:8080/getusers", {
        method: "GET",
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
            
        }
    }).then(function(res) {
        return res.json();
    }).then(function(res) {

        userLoop:
        for(var i = 0; i < res.length; i++)
        {
            /*
            for(var j = 0; j < table.rows.length; j++)
            {
                if(res[i].phone == table.rows[j].cells[4].innerHTML)
                {
                    continue userLoop;
                }
            }*/

            var id = res[i].id;
            var name = res[i].name;
            var email = res[i].email;
            var age = res[i].age;
            var phone = res[i].phone;
            var address = res[i].address;
            var gender = res[i].gender;
            var dob = res[i].dob;
            var button = document.createElement('button');
            button.setAttribute('value','Remove');
            button.name = id;
            button.innerHTML = 'Remove';
            button.setAttribute('onclick','removeUser('+button.name+')')

            var row = table.insertRow();
            var cell0 = row.insertCell(0);
            var cell1 = row.insertCell(1);
            var cell2 = row.insertCell(2);
            var cell3 = row.insertCell(3);
            var cell4 = row.insertCell(4);
            var cell5 = row.insertCell(5);
            var cell6 = row.insertCell(6);
            var cell7 = row.insertCell(7);
            var cell8 = row.insertCell(8);

            cell0.innerHTML = id;
            cell1.innerHTML = name;
            cell2.innerHTML = email;
            cell3.innerHTML = age;
            cell4.innerHTML = phone;
            cell5.innerHTML = address;
            cell6.innerHTML = gender;
            cell7.innerHTML = dob;
            cell8.appendChild(button);

            console.log(cell8.childNodes[0]);
        }

        shownTable = true;
        editHandler();
    
    })
}

function populateGraph()
{
    var graph = document.querySelector("#userAgeGraph");

    if(shownGraph == true)
    {
        console.log("already updated graph");
        return;
    }
    
    fetch("http://localhost:8080/getusers", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
            
        },
        mode: 'no-cors'
    }).then(function(res) {
        return res.json();
    }).then(function(res) {
        
        for(var i = 0; i < res.length;  i++)
        {
            var age = res[i].age;
            var name = res[i].name;

            var graphName = document.createElement('div');
            graphName.className = ("graphName");
            graphName.innerHTML = name;
            graph.appendChild(graphName);

            var ageContainer = document.createElement('div');
            ageContainer.className = ('ageContainer');

         
            var ageDiv = document.createElement('div');
            ageDiv.className = 'ages ' +name;
            ageDiv.innerHTML = age;


            ageContainer.appendChild(ageDiv);
            graph.appendChild(ageContainer);
            
          
        }

        //CSS
        var ages = document.querySelectorAll('.ages');
        for(var i = 0; i < ages.length; i++)
        {
            ages[i].style.textAlign = 'right';
            ages[i].style.paddingTop = '8px';
            ages[i].style.paddingBottom = '8px';
            ages[i].style.color = 'white';
        }

        for(var i = 0; i < res.length; i++)
        {
            var name = res[i].name;
            var age = res[i].age;

            var ageBar = document.querySelector('.' +name);
            ageBar.style.width = age + '%';
            ageBar.style.backgroundColor = 'green';
        }
        console.log(graph.childNodes[1]);
        console.log(graph.childNodes[2].childNodes[0]);
        console.log(graph.childNodes[2]);
        console.log(graph.childNodes[5]);
        shownGraph = true;

    })
}

function clearDb()
{
    fetch("http://localhost:8080/delete_users", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
         
        },
        mode: 'no-cors'
    }).then(function(res) {
        return res.json();
    }).then(function(res) {
        console.log(res);
})

    alert("Successfully cleared all users from the database ")
}

function createUser()
{
    var userName = document.querySelector('#userName').value;
    var userEmail = document.querySelector('#userEmail').value;
    var userAge = document.querySelector('#userAge').value;
    var userPhone = document.querySelector('#userPhone').value;
    var userAddress = document.querySelector('#userAddress').value;
    if(document.querySelector('#userGenderMale').checked)
    {
        var userGender = document.querySelector('#userGenderMale').value;
    }
    else
    {
        var userGender = document.querySelector('#userGenderFemale').value;
    }
    var userDob = document.querySelector('#userDob').value;

    fetch("http://localhost:8080/create_user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'

        },
        body: JSON.stringify({
            name: userName,
            email: userEmail,
            age: userAge,
            phone: userPhone,
            address: userAddress,
            gender: userGender,
            dob: userDob
        }),
        mode: 'no-cors'
    }).then(function(res) {
        return(res.json());
    }).then(function(res) {
        console.log(res);
    })
    
    alert('Successfully added user to the database.  Please update table by clicking show users');
}

function removeUser(id)
{
    var table = document.querySelector('#table');

    if(confirm('Are you sure you would like to delete this user from the database?'))
    {

   
    for(i = 1; i < table.rows.length; i++)
    {
        //var button = table.rows[i].cells[8].childNodes[0];
        if(table.rows[i].cells[0].innerHTML == id)
        {
            var userId = id;
            var userName = table.rows[i].cells[1].innerHTML;
            var userEmail = table.rows[i].cells[2].innerHTML;
            var userAge = table.rows[i].cells[3].innerHTML;
            var userPhone = table.rows[i].cells[4].innerHTML;
            var userAddress = table.rows[i].cells[5].innerHTML;
            var userGender = table.rows[i].cells[6].innerHTML;
            var userDob = table.rows[i].cells[7].innerHTML;
            
            table.deleteRow(i);
        }
    }

    //Delete user from database
    fetch("http://localhost:8080/delete_user", {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
     },
    body: JSON.stringify({
        id: userId,
        name: userName,
        email: userEmail,
        age: userAge,
        phone: userPhone,
        address: userAddress,
        gender: userGender,
        dob: userDob
    }),
    mode: 'no-cors'
    }).then(function(res) {
        return(res.json());
    }).then(function(res) {
        console.log(res);
    })
}

    event.stopPropagation();
}

function editHandler()
{
    var table = document.querySelector('#table');
    var graph = document.querySelector("#userAgeGraph");


    for(i = 1; i < table.rows.length; i++)
    {
    
      
        var createClickHandler = function(row)
        {
            return function()
            {
               
                if(confirm("Update user with id: "+row.cells[0].innerHTML+" from the table?"))
                {
            
                    var userId = row.cells[0].innerHTML;
                    var userName = prompt('Enter new name', row.cells[1].innerHTML);
                    var userEmail = prompt('Enter new email',row.cells[2].innerHTML);
                    var userAge = prompt('Enter new age',row.cells[3].innerHTML);
                    var userPhone = prompt('Enter new phone number',row.cells[4].innerHTML);
                    var userAddress = prompt('Enter new address',row.cells[5].innerHTML);
                    var userGender = prompt('Enter new gender',row.cells[6].innerHTML);
                    var userDob = prompt('Enter new date of birth',row.cells[7].innerHTML)     

                    /*
                    //Delete from graph
                    for(var i = 1; i < table.rows.length; i++)
                    {
                 
                        
                        if(graph.childNodes[i].innerHTML == row.cells[1].innerHTML)
                        {
                           
                            graph.childNodes[i+1].innerHTML = '';
                            graph.removeChild(graph.childNodes[i+1]);
                            graph.childNodes[i].innerHTML = '';
                            graph.removeChild(graph.childNodes[i]);
                        
                        }
                    }*/
                
                    //Update table entry
                    row.cells[1].innerHTML = userName;
                    row.cells[2].innerHTML = userEmail;
                    row.cells[3].innerHTML = userAge;
                    row.cells[4].innerHTML = userPhone;
                    row.cells[5].innerHTML = userAddress;
                    row.cells[6].innerHTML = userGender;
                    row.cells[7].innerHTML = userDob;
                    
                    
                    
                    //Update database entry
                    fetch("http://localhost:3000/edit_user", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: userId,
                            name: userName,
                            email: userEmail,
                            age: userAge,
                            phone: userPhone,
                            address: userAddress,
                            gender: userGender,
                            dob: userDob
                        }),
                        mode: 'no-cors'
                    }).then(function(res) {
                        return(res.json());
                    }).then(function(res) {
                        console.log(res);
                    })
                    
                }
            }
        }

        var currRow = table.rows[i];
        currRow.onclick = createClickHandler(currRow);
    }

}


