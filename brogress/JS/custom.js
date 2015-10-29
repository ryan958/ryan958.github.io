function loginSubmit() {
  var email = document.getElementById("email").value;
  var atIndex = email.indexOf("@");
  var emailAddress = email.substring(0, atIndex);
  var emailDomain = email.substring(atIndex + 1);
  if (document.getElementById("loginCheckbox").checked) {
    document.cookie="email=" + email;
  }
}

function checkEmail() {
  var email = document.getElementById("email").value;
  if ((email.indexOf("@") != -1) && ((email.indexOf(".") != -1))) {
    document.getElementById("email").style.backgroundColor="#8CC393";
  } else {
    document.getElementById("email").style.backgroundColor="#FBB9B5";
  }
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function populateEmail() {
document.cookie = "hello=world";
var cookie = getCookie("hello");
if (cookie == "") {
  window.alert("no cookie");
}
}

function onpageLoad() {
  populateEmail();
}
