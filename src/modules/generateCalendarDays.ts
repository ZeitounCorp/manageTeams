import * as firebase from 'firebase';

export const generateDays = () => {
  const actualYear = new Date().getFullYear();
  const startingYear = 2019;
  const year = [{ tYear: actualYear, Months: [] }];
  const Months = [
    { month: 'Janvier', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Février', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Mars', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Avril', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Mai', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Juin', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Juillet', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Aout', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Septembre', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Octobre', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Novembre', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] },
    { month: 'Décembre', incomeUSD: 0, incomeEUR: 0, incomeILS: 0, days: [] }
  ];

  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < Months.length; i++) {
    if (i === 0) {
      // tslint:disable-next-line:prefer-for-of
      for (let nb = 1; nb < 32; nb++) {
        const day = {
          day: nb,
          incomeUSD: 0,
          incomeEUR: 0,
          incomeILS: 0,
          hours: []
        };
        for (let ie = 0; ie < 24; ie++) {
          const hourSchema = {
            hour: `${ie} h`,
            spending: []
          };
          day.hours.push(hourSchema);
        }
        Months[i].days.push(day);
      }
    } else if (i === 1 && actualYear % 4 === 0) {
      for (let nb = 1; nb < 30; nb++) {
        const day = {
          day: nb,
          incomeUSD: 0,
          incomeEUR: 0,
          incomeILS: 0,
          hours: []
        };
        for (let ie = 0; ie < 24; ie++) {
          const hourSchema = {
            hour: `${ie} h`,
            spending: []
          };
          day.hours.push(hourSchema);
        }
        Months[i].days.push(day);
      }
    } else if (i === 1 && actualYear % 4 !== 0) {
      for (let nb = 1; nb < 29; nb++) {
        const day = {
          day: nb,
          incomeUSD: 0,
          incomeEUR: 0,
          incomeILS: 0,
          hours: []
        };
        for (let ie = 0; ie < 24; ie++) {
          const hourSchema = {
            hour: `${ie} h`,
            spending: []
          };
          day.hours.push(hourSchema);
        }
        Months[i].days.push(day);
      }
    } else if (12 % i === 0 && i !== 3 || i === 7 || i === 9 || i === 11) {
      for (let nb = 1; nb < 32; nb++) {
        const day = {
          day: nb,
          incomeUSD: 0,
          incomeEUR: 0,
          incomeILS: 0,
          hours: []
        };
        for (let ie = 0; ie < 24; ie++) {
          const hourSchema = {
            hour: `${ie} h`,
            spending: []
          };
          day.hours.push(hourSchema);
        }
        Months[i].days.push(day);
      }
    } else {
      for (let nb = 1; nb < 31; nb++) {
        const day = {
          day: nb,
          incomeUSD: 0,
          incomeEUR: 0,
          incomeILS: 0,
          hours: []
        };
        for (let ie = 0; ie < 24; ie++) {
          const hourSchema = {
            hour: `${ie} h`,
            spending: []
          };
          day.hours.push(hourSchema);
        }
        Months[i].days.push(day);
      }
    }
  }

  Months.forEach(month => {
    year[0].Months.push(month);
  });
  // if (actualYear !== startingYear) {
  const calRef = firebase.database().ref('stats').push();
  calRef.set({
    totalIncomeUSD: 0,
    totalIncomeEUR: 0,
    totalIncomeILS: 0,
    currentYear: actualYear,
    ref: calRef.key,
    year: { ...year }
  });
// }
  return year;
};
