"use strict";

(function () {
  var KEY = "mena-songbucket";

  var SONGS = [
    { title: "Perfect", artist: "Ed Sheeran", why: "Our song \u2014 the one I think of first." },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", why: "Slow, and a little brave." },
    { title: "Just the Way You Are", artist: "Bruno Mars", why: "Every word of it is true." },
    { title: "A Thousand Years", artist: "Christina Perri", why: "For the patient kind of love." },
    { title: "Make You Feel My Love", artist: "Adele", why: "When words are not enough." },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", why: "To hum on a slow evening." },
    { title: "La Vie en Rose", artist: "\u00c9dith Piaf", why: "A little French for a little romance." },
    { title: "Tu Jaane Na", artist: "Atif Aslam", why: "Something from home, for you." },
    { title: "Dragostea Din Tei", artist: "O-Zone", why: "A Romanian classic \u2014 for fun." },
    { title: "All of Me", artist: "John Legend", why: "All the edges and all the curves." },
    { title: "You Are the Reason", artist: "Calum Scott", why: "Because you are." },
    { title: "Moon River", artist: "Audrey Hepburn", why: "Two drifters, off to see the world." },
    { title: "Nothing's Gonna Change My Love for You", artist: "George Benson", why: "A promise you can sing." },
    { title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", why: "For the very dramatic evenings." },
    { title: "Can't Take My Eyes Off You", artist: "Frankie Valli", why: "The chorus is pure joy." },
    { title: "I'll Be Seeing You", artist: "Billie Holiday", why: "For the nights apart." }
  ];

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function $(id) { return document.getElementById(id); }

  var els = {
    sentNote: $("sent-note"),
    progressFill: $("progress-fill"),
    progressLabel: $("progress-label"),
    doneCount: $("done-count"),
    totalCount: $("total-count"),
    list: $("song-list"),
    surprise: $("surprise"),
    addTitle: $("add-title"),
    addArtist: $("add-artist"),
    addWhy: $("add-why"),
    add: $("add"),
    addMsg: $("add-msg"),
    share: $("share"),
    note: $("note")
  };

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    if (m.length < 2) m = "0" + m;
    var day = String(d.getDate());
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { done: {}, custom: [] };
      var data = JSON.parse(raw);
      return {
        done: data && data.done && typeof data.done === "object" ? data.done : {},
        custom: data && Array.isArray(data.custom) ? data.custom : []
      };
    } catch (e) {
      return { done: {}, custom: [] };
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  var pickedSlug = null;

  function allSongs() {
    var out = [];
    var used = {};
    function push(s) {
      var base = s.slug || slugify(s.title) || "song";
      var slug = base;
      var n = 2;
      while (used[slug]) { slug = base + "-" + n; n++; }
      used[slug] = true;
      out.push({ slug: slug, title: s.title, artist: s.artist, why: s.why || "", custom: !!s.custom });
    }
    var i;
    for (i = 0; i < SONGS.length; i++) push(SONGS[i]);
    for (i = 0; i < state.custom.length; i++) push(state.custom[i]);
    return out;
  }

  function render() {
    var songs = allSongs();
    var doneCount = 0;
    els.list.textContent = "";

    for (var i = 0; i < songs.length; i++) {
      var song = songs[i];
      var done = !!state.done[song.slug];
      if (done) doneCount++;

      var li = document.createElement("li");
      li.className = "song-row" + (done ? " done" : "") + (song.slug === pickedSlug ? " picked" : "");
      li.setAttribute("data-slug", song.slug);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sing-btn";
      btn.setAttribute("aria-pressed", done ? "true" : "false");
      btn.setAttribute("aria-label", done ? "Mark as not yet sung" : "Mark as sung together");
      btn.textContent = done ? "\u2713" : "\u266a";
      (function (slug) {
        btn.addEventListener("click", function () { toggle(slug); });
      })(song.slug);

      var body = document.createElement("div");
      body.className = "song-body";

      var title = document.createElement("div");
      title.className = "song-title";
      title.textContent = song.title;
      body.appendChild(title);

      var artist = document.createElement("div");
      artist.className = "song-artist";
      artist.textContent = song.artist;
      body.appendChild(artist);

      if (song.why) {
        var why = document.createElement("p");
        why.className = "song-why";
        why.textContent = song.why;
        body.appendChild(why);
      }

      if (done) {
        var sung = document.createElement("p");
        sung.className = "song-sung";
        sung.textContent = "Sung together " + state.done[song.slug];
        body.appendChild(sung);
      }

      li.appendChild(btn);
      li.appendChild(body);
      els.list.appendChild(li);
    }

    els.doneCount.textContent = String(doneCount);
    els.totalCount.textContent = String(songs.length);
    var pct = songs.length ? Math.round((doneCount / songs.length) * 100) : 0;
    if (els.progressFill) els.progressFill.style.width = pct + "%";
    els.progressLabel.textContent = pct + "% sung together";
  }

  function toggle(slug) {
    if (state.done[slug]) { delete state.done[slug]; }
    else { state.done[slug] = todayISO(); }
    save(state);
    render();
  }

  function surprise() {
    var undone = allSongs().filter(function (s) { return !state.done[s.slug]; });
    if (!undone.length) {
      pickedSlug = null;
      els.note.textContent = "Every song is sung \u2014 let's write a new one \u2665";
      render();
      return;
    }
    var pick = undone[Math.floor(Math.random() * undone.length)];
    pickedSlug = pick.slug;
    els.note.textContent = "Tonight, try: " + pick.title + " \u2014 " + pick.artist;
    render();
    var row = els.list.querySelector ? els.list.querySelector('[data-slug="' + pick.slug + '"]') : null;
    if (row && typeof row.scrollIntoView === "function") {
      try { row.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    }
  }

  function add() {
    var title = String(els.addTitle.value || "").trim();
    var artist = String(els.addArtist.value || "").trim();
    var why = String(els.addWhy.value || "").trim();
    if (!title) { els.addMsg.textContent = "Give the song a title first."; return; }
    if (!artist) artist = "\u2014";
    var slug = slugify(title) || "song";
    var existing = allSongs();
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].slug === slug) {
        els.addMsg.textContent = "\u201c" + title + "\u201d is already in the bucket.";
        return;
      }
    }
    state.custom.push({ slug: slug, title: title, artist: artist, why: why });
    save(state);
    els.addTitle.value = "";
    els.addArtist.value = "";
    els.addWhy.value = "";
    els.addMsg.textContent = "Added to the bucket \u2665";
    render();
  }

  function copy(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { els.note.textContent = message; },
        function () { els.note.textContent = text; }
      );
    } else {
      els.note.textContent = text;
    }
  }

  function share() {
    var undone = allSongs().filter(function (s) { return !state.done[s.slug]; });
    var slug = pickedSlug;
    if (!slug && undone.length) { slug = undone[Math.floor(Math.random() * undone.length)].slug; }
    var base = window.location.origin + window.location.pathname;
    var link = slug ? base + "?song=" + encodeURIComponent(slug) : base;
    if (slug) { pickedSlug = slug; render(); }
    copy(link, "Song link copied \u2014 send it to Ammar.");
  }

  function arrival() {
    var params = new URLSearchParams(window.location.search);
    var song = params.get("song");
    if (!song) return;
    var found = null;
    var all = allSongs();
    for (var i = 0; i < all.length; i++) { if (all[i].slug === song) { found = all[i]; break; } }
    pickedSlug = song;
    els.sentNote.hidden = false;
    els.sentNote.textContent = found
      ? "\u2665 Ammar picked \u201c" + found.title + "\u201d for tonight \u2014 want to sing it together?"
      : "\u2665 Ammar picked a song for tonight \u2014 want to sing it together?";
    render();
  }

  function init() {
    render();
    arrival();
    if (els.surprise) els.surprise.addEventListener("click", surprise);
    if (els.add) els.add.addEventListener("click", add);
    if (els.share) els.share.addEventListener("click", share);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
