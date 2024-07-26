var _socket = null;
var map = null;
var mark = null;
async function get_address(t) {
  return await $.ajax({
    type: "POST",
    url: "https://www.oneqlik.in/googleAddress/getGoogleAddress",
    data: {
      lat: t.last_location.lat,
      long: t.last_location.long,
    },
  });
}
async function setData(data) {
  $("#object-name").text(data.Device_Name);
  $("#object-status-info").text(data.status);
  $("#speed").text(data.last_speed);
  const date1 = dayjs(new Date());
  const date2 = dayjs(data.status_updated_at);
  let tm = date1.diff(date2, "m");
  let h = (tm / 60).toFixed();
  let m = tm % 60;
  $("#duration").text(h + " hr," + m + " min");
  let add_result = await get_address(data);
  $("#address").text(add_result.address ? add_result.address : "N/A");
}
function validate() {
  return new Promise(function (a, b) {
    $.ajax({
      type: "POST",
      url: "https://www.oneqlik.in/share/validate",
      data: {
        t: window.location.search.replace("?t=", ""),
      },
      success: function (result) {
        a(result.result);
      },
    });
  });
}

function socket_conn(user) {
  return new Promise(function (a, b) {
    // _socket = io.connect("http://wetrack.pk/gps?userId=" + user, {
    _socket = io.connect("https://soc.oneqlik.in/gps?userId=" + user, {
      secure: false,
      rejectUnauthorized: false,
      transports: ["websocket", "polling"],
      upgrade: false,
    });
    _socket.on("connect", (socket) => {
      a(true);
    });
  });
}
move_clear = null;
function imei_conn(imei) {
  var date = new Date().setHours(0, 0, 0, 0);
  _socket.emit("initLive", imei, date);
  _socket.on(imei, function (msg, initData, deviceInfo) {
    console.log("a user connected 41", msg, initData, deviceInfo);
    debugger;
    setData(deviceInfo);

    var lat_lng = [
      deviceInfo.sec_last_location.long,
      deviceInfo.sec_last_location.lat,
    ];
    //   console.log("GPT=>", x);
    if (move_clear != undefined) {
      clearInterval(move_clear);
    }
    if (map == null) {
      map = create_map(lat_lng);
      mark = create_marker(deviceInfo);
    }
    move(deviceInfo, 500, mark);
  });
}

validate().then(function (resp) {
  socket_conn(resp.sharedBy).then(function () {
    imei_conn(resp.deviceImei);
  });
});

//   start map
function create_map(lat_lng) {
  // style: "http://wetrack.pk/maps/styles/test-style/style.json",

  return new maplibregl.Map({
    container: "map",
    style:
      "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",

    center: lat_lng,
    zoom: 15,
  });
}
function get_icn(t) {
  return `https://www.oneqlik.in/images/${
    t.status.toLocaleLowerCase() + t.iconType.toLocaleLowerCase()
  }.png?id=123`;
}
function create_marker(data) {
  const el = document.createElement("div");
  el.className = "marker";
  el.style.backgroundImage = `url("${get_icn(data)}")`;
  console.log(el.style.backgroundImage);
  el.style.width = "32px";
  el.style.height = "58px";

  el.addEventListener("click", () => {
    window.alert(marker.properties.message);
  });

  // add marker to map
  var x = new maplibregl.Marker({ element: el })
    .setLngLat([67.28892, 24.86352])
    .setRotation(50)

    .addTo(map);

  return x;
}
function animateMarker(marker, _data) {
  marker
    .setLngLat([_data.last_location.long, _data.last_location.lat])

    .setRotation(_data.heading)
    .addTo(map);

  map.flyTo({
    center: [_data.last_location.long, _data.last_location.lat],
    zoom: 15,
  });
}

function move(_data, step, marker) {
  var cnt = 0;
  var start = {
    lat: _data.sec_last_location.lat,
    lng: _data.sec_last_location.long,
  };
  var end = {
    lat: _data.last_location.lat,
    lng: _data.last_location.long,
  };
  var n = step; // the number of coordinates you want

  coordinates = [];
  for (var i = n - 1; i > 0; i--) {
    coordinates.push({
      lat: (start.lat * i) / n + (end.lat * (n - i)) / n,
      lng: (start.lng * i) / n + (end.lng * (n - i)) / n,
    });
  }
  console.log("coordinates=>", coordinates);
  move_clear = setInterval(function () {
    if (
      coordinates[cnt] != undefined &&
      coordinates[cnt].lng != undefined &&
      coordinates[cnt].lat != undefined
    ) {
      marker
        .setLngLat([coordinates[cnt].lng, coordinates[cnt].lat])

        .setRotation(_data.heading)
        .addTo(map);

      map.flyTo({
        center: [coordinates[cnt].lng, coordinates[cnt].lat],
      });
    }

    if (cnt == step) {
      cnt = 0;
    }
    cnt = cnt + 1;
  }, 40);
}
