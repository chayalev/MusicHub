import Swal from 'sweetalert2';

const checkAuthorization = (pathname) => {
  if(pathname=='/'){
    return true
  }
  const userFromURL = pathname.split('/')[1]; // Assuming the ID is at the end of the URL
  const idFromUrl=pathname.split('/')[2];
  let stateCheck=false;
  let idFromSession;
  //שלא יחליף לממשתמש לזמר
  if (userFromURL == 'user') {
    idFromSession = JSON.parse(sessionStorage.getItem('currentUser'))?.userId;
  }
  else {
    idFromSession = JSON.parse(sessionStorage.getItem('currentUser'))?.singerId;
  }
  if(!idFromSession)
    stateCheck=true;
  else if(idFromSession!=idFromUrl)
    stateCheck=true;
  if (stateCheck) {
    Swal.fire({
      icon: 'error',
      title: 'שגיאת אבטחה',
      text: 'אינך מורשה לגשת למערכת',
      confirmButtonText: 'אישור'
    });

    return true;
  }

  return false;
};

export default checkAuthorization;
