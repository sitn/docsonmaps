
const styleUrls = [
  'https://sitn.ne.ch/sitnstatic/sitn-bootstrap@v5.2.3/sitn-bootstrap.css',
  //'../../node_modules/bootstrap-icons/bootstrap.min.css'
]
const sheets: CSSStyleSheet[] = [];

if (typeof CSSStyleSheet !== 'undefined') {
  for (let i = 0; i < styleUrls.length; i++) {
    sheets.push(new CSSStyleSheet());
  }
  Promise.all(styleUrls.map(styleURL => fetch(styleURL).then(response => response.text())))
    .then(styles => {
      for (let i = 0; i < styles.length; i++) {
        sheets[i].replace(styles[i]);
      }
      // avoid showing stuff before css is loaded
      document.getElementById('initially-hidden')!.style.visibility = 'visible';
    });
}


export default sheets;