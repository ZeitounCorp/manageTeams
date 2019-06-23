export const getDate = () => {
    const myDate = new Date();

    const month = new Array();
    month[0] = "Jan";
    month[1] = "Feb";
    month[2] = "Mar";
    month[3] = "Apr";
    month[4] = "May";
    month[5] = "Jun";
    month[6] = "Jul";
    month[7] = "Aug";
    month[8] = "Sep";
    month[9] = "Oct";
    month[10] = "Nov";
    month[11] = "Dec";
    let hours = myDate.getHours();
    let minutes = (myDate.getMinutes()).toString();
    hours = hours % 24;
    hours = hours ? hours : 12;
    // tslint:disable-next-line:radix
    minutes = parseInt(minutes) < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes;
    // e.g. "13 Nov 2016 11:00pm";
    const date = myDate.getDate() + " " + month[myDate.getMonth()] + " " + myDate.getFullYear();

    return date;
  };
