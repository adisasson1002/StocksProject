const form=document.getElementById('form');
const email=document.getElementById('email');
const pswd=document.getElementById('password');
const confirm=document.getElementById('conf');
const msg1=document.getElementById('eErr');

function validEmail(){
    let validMail= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(!email.value.match(validMail))
    {
        msg1.innerText="Invalid email address";
        return false;
    }

    msg1.innerText="";
    return true;

    
}


