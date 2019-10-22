'use strict';

window.onload = function(){

    if ( localStorage.getItem('user') ){
        window.app = new App();
    } else {
        window.login.style.display = 'block';
    }

}

window.onsubmit = function(e){
    e.preventDefault();

    let form = e.target,
        name = form.name.value,
        pass = form.password.value,
        _uri = 'https://private-cc9db-shop75.apiary-mock.com/login',
        request = new XMLHttpRequest();
    
    request.open('GET', _uri );
    request.send();

    let result = new Promise ( function (resolve ) {

        request.onreadystatechange = function () {
            
            if ( this.readyState == 4 ){

                let res = JSON.parse(this.response);

                for ( let key in res ){
                    resolve(res[key]);
                }

            }
        }

    });

    result.then( function(res) {
        let users = res['users'];

        for ( let key in users ) {
            if ( users[key].username == name && users[key].password == pass ) {       
                window.app = new App(users[key]);
                return;
            }
        }

        alert(`User ${name} undefined =(`);
    });

}