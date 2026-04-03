import { openIncidentForm } from "./incident-form.js";

export function initMapActions(map, token) {
  let currentPopup = null;
  map.on("click", (e) => {
    const { lat, lng } = e.latlng;

    if (currentPopup) {
      map.closePopup(currentPopup);
    }

    const content = `
            <div style = "min-width:150px min-height:150px">         
              <button id="report-incident-btn" class="button" role="button">
              Report Incident</button>


            </div>
            `;
    currentPopup = L.popup({ minWidth: 200, maxHeight: 200 })
      .setLatLng([lat, lng])
      .setContent(content)
      .openOn(map);
    //wait for dom render
    // setTimeout(() => {
    //   const btn = document.getElementById("report-incident-btn");
    //   if (btn) {
    //     btn.onclick = () => {
    //       openIncidentForm(map, lat, lng, token);
    //     };
    //   }
    // }, 0);

    window.__clickedLatlng={lat,lng};
    //store current coordinates golbally
  });
  //using event delegation instead of getelementbyid
  //doesn't open when location changes
  //DOM timing bug
  //popup HTML is injected DOM not ready
  //event binding fails sometimes
  //settimeout is not reliable

  //event listner doesn't depend on dom timing
  //works even if popup re-renders
  //scalable(multiple buttons later)
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "report-incident-btn") {
      const { lat, lng } = window.__clickedLatlng;
      openIncidentForm(map, lat, lng, token);
    }
  });
}

//bug due to 
//popup DOM recreated every click
//event binding lost
//timting mismatch
