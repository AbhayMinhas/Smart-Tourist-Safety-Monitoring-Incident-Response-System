let isIncidentHandlerAttached = false;

export function showToast(message, type = "success") {
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
export function openIncidentForm(map, lat, lng, token,clusterGroup, getIncidentIcon,animateMarker) {
  function setLoading(button, isLoading) {
    const text = button.querySelector(".btn-text");
    const loader = button.querySelector(".btn-loader");

    if (isLoading) {
      button.disabled = true;
      text.style.display = "none";
      loader.classList.remove("hidden");
    } else {
      button.disabled = false;
      text.style.display = "inline";
      loader.classList.add("hidden");
    }
  }


  console.log("incidentformOpen");
  window.__clickedLatLng = { lat, lng };
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
        <span class="btn-text">Submit</span>
        <span class="btn-loader hidden"></span>
    </button>
</div>`;
  const popup = L.popup({ minWidth: 400, maxHeight: 700 })
    .setLatLng([lat, lng])
    .setContent(formHtml)
    .openOn(map);

  if (!isIncidentHandlerAttached) {
    isIncidentHandlerAttached = true;

    document.addEventListener("click", async (e) => {
      if (e.target && e.target.id === "submit-incident") {
        const button = e.target;
        const { lat, lng } = window.__clickedLatLng;
        const type = document.getElementById("incident-type")?.value;
        const description = document.getElementById("incident-desc")?.value;

        if (!type) {
          showToast("type is required", "error");
          return;
        }

        setLoading(button, true);

        const processingMarker = L.marker([lat, lng], {
          icon: getIncidentIcon(type),
        });

        processingMarker
          .bindPopup(
            `<b>${type}</b><br/>${description || "no description given..."}<br/><i>Sending...</i>`,
          )
          .openPopup();

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
              `<b>${type}</b><br/>${description || "no description given..."}`,
            );
          } else {
            throw new Error(data.message);
          }
          showToast("Incident reported successfully", "success");
        } catch (err) {
          console.error(err);
          clusterGroup.removeLayer(processingMarker);
          showToast("Failed to report incident", "error");
        } finally {
          setLoading(button, false);
        }
      }
    });
  }
}
