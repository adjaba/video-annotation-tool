create table Videos (
  id integer primary key autoincrement,
  videoName text not null,
  currentJson text not null,
  referenceLink,
  form text not null,
  lastEdited real default 0.0
);