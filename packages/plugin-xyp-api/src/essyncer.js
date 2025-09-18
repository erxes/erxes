module.exports = [
  {
    name: "xyp_datas",
    schema: "{ 'createdAt': { 'type': 'date' }, 'data': <nested> }",
    script: "if (ns.indexOf('xyp_datas') > -1) { if (doc.data) { doc.data.forEach(function(d) { if (d.data) { delete d.data; } }); } }"
  }
];
