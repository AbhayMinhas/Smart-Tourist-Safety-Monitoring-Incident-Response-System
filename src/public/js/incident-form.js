export function openIncidentForm(map, lat, lng, token) {
  console.log("incidentformOpen");
  const formHtml = `
    <div class="incident-form">
    <h4 class="form-title">Report Incident</h4>

    <div class="form-group">
        <label>Type</label>
        <select id="incident-type">
            <option value="theft">Theft</option>
            <option value="accident">Accident</option>
            <option value="harassment">Harassment</option>
            <option value="other">Other</option>
        </select>
    </div>

    <div class="form-group">
        <label>Description</label>
        <textarea id="incident-desc" placeholder="Describe what happened..."></textarea>
    </div>

    <button id="submit-incident" class="submit-btn">
        Submit
    </button>
</div>`;

  function showToast(message, type = "success") {
            const container = document.getElementById("toast-container");
            
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            toast.innerText = message;
            
            container.appendChild(toast);
            
            // trigger animation
            setTimeout(() => toast.classList.add("show"), 10);
            
            // remove after 3s
            setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => container.removeChild(toast), 300);
            }, 3000);
        }
  const popup = L.popup({ minWidth: 400, maxHeight: 700 })
    .setLatLng([lat, lng])
    .setContent(formHtml)
    .openOn(map);

  setTimeout(() => {
    document.getElementById("submit-incident").onclick = async () => {
      const type = document.getElementById("incident-type").value;
      const description = document.getElementById("incident-desc").value;

      const processingMarker = L.marker([lat, lng], {
        icon: getIncidentIcon(type),
      });

      processingMarker.bindPopup(
        `<b>${type}</b><br/>${description || ""}<br/><i>Sending...</i>`,
      ).openPopup();

      clusterGroup.addLayer(processingMarker);
      animateMarker(processingMarker);
      try {
        const res = await fetch("/api/incidents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            description,
            lat,
            lng,
          }),
        });
        const data = await res.json();

        if (data.success) {
          console.log("Incident reported successfully");
          map.closePopup(popup);
          processingMarker.setPopupContent(
            `<b>${type}</b><br/>${description || ""}`,
          );
        } else {
          throw new Error(data.message);
        }
        showToast("Incident reported successfully","success");
      } catch (err) {
        console.error(err);
        clusterGroup.removeLayer(processingMarker);
        showToast("Failed to report incident","error");
      }
    };
  }, 0);
}
