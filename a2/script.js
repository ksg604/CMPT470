var sortNameAsc = false;
var sortNameDesc = false;

var sortEmailAsc = false;
var sortEmailDesc = false;

var sortAgeAsc = false;
var sortAgeDesc = false;

function avgAgeCalc()
{
	var t = document.getElementById("Table");
	var avgAge = 0;
	
	for(i = 1; i < t.rows.length; i++)
	{
		avgAge = avgAge + parseInt(t.rows[i].cells[3].innerHTML);
	}

	avgAge = avgAge / (t.rows.length-1);

	var avgAgeString = document.getElementsByClassName("userAvgAge");
	avgAgeString[0].innerHTML = ("Average Age: The average age of all users is " + avgAge.toString() + ".");

}

function submitUser()
{

	//Retrieve input data
	var name = document.getElementById("userInfo").elements["Name"].value;
	var email = document.getElementById("userInfo").elements["Email"].value;
	var age = document.getElementById("userInfo").elements["Age"].value;
	
	//Get our HTML table
	var t = document.getElementById("Table");
	var userNumber = document.getElementById("Table").rows.length;

	//Create table row, insert cells into it
	var row = t.insertRow();
	var cell0 = row.insertCell(0); //User number cell
	var cell1 = row.insertCell(1); //Name cell
	var cell2 = row.insertCell(2); //Email cell
	var cell3 = row.insertCell(3); //Age cell

	//Insert form information into table cells
	cell0.innerHTML = userNumber;
	cell1.innerHTML = name;
	cell2.innerHTML = email;
	cell3.innerHTML = age;

	sortAsc = false;
	sortDesc = false;

	sortNameAsc = false;
	sortNameDesc = false;

	sortEmailAsc = false;
	sortEmailAsc = false;

	avgAgeCalc();
	addRowHandlers();

}

function sortName()
{
	if((sortNameAsc == false && sortNameDesc == false) || (sortNameAsc == false && sortNameDesc == true))
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(t.rows[j].cells[1].innerHTML > t.rows[j+1].cells[1].innerHTML)
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}

		sortNameAsc = true;
		sortNameDesc = false;
	}
	else if(sortNameAsc == true && sortNameDesc == false)
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(t.rows[j].cells[1].innerHTML < t.rows[j+1].cells[1].innerHTML)
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}

		sortNameAsc = false;
		sortNameDesc = true;

	}
}

function sortEmail()
{
	if((sortEmailAsc == false && sortEmailDesc == false) || (sortEmailAsc == false && sortEmailDesc == true))
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(t.rows[j].cells[2].innerHTML > t.rows[j+1].cells[2].innerHTML)
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}

		sortEmailAsc = true;
		sortEmailDesc = false;
	}
	else if(sortEmailAsc == true && sortEmailDesc == false)
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(t.rows[j].cells[2].innerHTML < t.rows[j+1].cells[2].innerHTML)
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}

		sortEmailAsc = false;
		sortEmailDesc = true;
	}

}

function sortAge()
{

	//Sort ages in ascending order
	if((sortAgeAsc == false && sortAgeDesc == false) || (sortAgeAsc == false && sortAgeDesc == true))
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(parseInt(t.rows[j].cells[3].innerHTML) > parseInt(t.rows[j+1].cells[3].innerHTML))
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}

		sortAgeAsc = true;
		sortAgeDesc = false;
	}


	//Sort ages in descending order
	else if(sortAgeAsc == true && sortAgeDesc == false)
	{
		var t = document.getElementById("Table");

		for(var i = 0; i < t.rows.length-1; i++)
		{
			for(var j = 1; j < t.rows.length-i-1; j++)
			{
			
				if(parseInt(t.rows[j].cells[3].innerHTML) < parseInt(t.rows[j+1].cells[3].innerHTML))
				{
				
					var temp = t.rows[j].innerHTML;
					t.rows[j].innerHTML = t.rows[j+1].innerHTML;
					t.rows[j+1].innerHTML = temp;

				}
			}
		}
		sortAgeDesc = true;
		sortAgeAsc = false;

	}
	
}


function addRowHandlers()
{

	var t = document.getElementById("Table");

	for (i = 1; i < t.rows.length; i++)
	{
		
		var createClickHandler = function(row) 
		{
			return function() 
			{
				if(confirm("Remove this user?"))
				{
					t.deleteRow(row.rowIndex);

					//Re-calculate user numbers.
					for(i = 1; i < t.rows.length; i++)
					{
						if(parseInt(t.rows[i].cells[0].innerHTML) > parseInt(row.cells[0].innerHTML))
						{
							t.rows[i].cells[0].innerHTML = parseInt(t.rows[i].cells[0].innerHTML) - 1;
						}
					}

					//Re-Calculate average age of all the users
					if(t.rows.length > 1)
					{
						avgAgeCalc();
					}
					else
					{
						var avgAgeString = document.getElementsByClassName("userAvgAge");
						avgAgeString[0].innerHTML = ("Average Age: ");
					}
					
				}
				else
				{
					
				}

				
			};
		};

		var currRow = t.rows[i];
		currRow.onclick = createClickHandler(currRow);
	}
}




