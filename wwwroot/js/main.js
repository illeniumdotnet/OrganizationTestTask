'use strict'

let data = [];
let selectedB;
let selectedR;
let isSelectedB;
let selectedF;



function createIndicator() {
    return '<span class="indicator"></span>'
}

function createB(b) {
    return '<div class="building" id="b' + b.id
        + '"><div class="bclick h-text-data">' + createIndicator() +
        '<p>' + b.name + '</p></div>';
}

function createR(r, bid) {
    return '<div class="room" id="r' + r.id + '" data-roomindex="'
        + r.id + '"><div class="rclick h-text-data" data-bid="' + bid + '">'
        + createIndicator() + '<p>' + r.name + '</p></div>';
}

function createF(f, rid) {
    return '<div class="facilities" data-rid="' + rid + '" id="f'
        + f.id + '">' + '<div class="f-data-input"><p>Id:</p>' +
        '<p class="f-id-input">' + f.id + '</p></div>' +
        '<div class="f-data-input"><p>Name:</p>' +
        '<p class="f-name-input">' + f.name + '</p></div>' +
        '<div class="f-data-input"><p>Count: </p><p class="f-count-input" >' +
        f.count + '</p></div>';
    ;
}

async function GetBuildingsName() {
    const response = await fetch("/api/org", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        let buildings = await response.json();
        buildings.forEach(b => {
            $('.left-side').append(createB(b));
        });
    }
}

async function GetBuildingsData(id) {
    const response = await fetch("/api/org/" + id, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        let bdata = await response.json();
        bdata.forEach(r => {
            $('#b' + id).append(createR(r.Key, id))
        });
        return bdata;
    }
}



function changeVis(isv, selector) {
    let target = $(selector);
    if (isv) target.css('visibility', 'visible');
    else target.css('visibility', 'collapse');
}

function changeSelection(selector) {
    $('.selected').removeClass('selected');
    $(selector).addClass('selected');
}

async function CreateFacilities(rId, n, c) {

    const response = await fetch("api/org/add/" + rId, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            name: n,
            count: c
        })
    });
    if (response.ok === true) {
        const f = await response.json();
        $('.right-side-data').append(createF(f, rId));
        data[rId - 1].room.Value.push({ id: f.id, name: f.name, count: f.count });
    }
    else {
        alert('Element can\'t be added. ' + response.statusText);
    }
}

async function EditFacilities(fId, n, c) {

    const response = await fetch("api/org/rewrite/" + fId, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            id: fId,
            name: n,
            count: c
        })
    });
    if (response.ok === true) {
        const f = await response.json();
        $('#f' + fId).find('.f-name-input').empty().append(n);
        $('#f' + fId).find('.f-count-input').empty().append(c);
        let index = parseInt($('#f' + fId).data('rid')) - 1;
        let frealIndex = data[index].room.Value.findIndex(f => f.id == fId);
        data[index].room.Value[frealIndex].name = n;
        data[index].room.Value[frealIndex].count = c;
    }
    else {
        alert('Element can\'t be edited. ' + response.statusText);
    }
}

async function RemoveFacilities(fId) {

    let rId = parseInt($('.right-side').data('roomindex'));
    const response = await fetch("api/org/" + rId + '/' + fId, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            rId: rId,
            fId: fId
        })
    });
    if (response.ok === true) {
        $('#f' + fId).remove();
        let removedIndex = data[rId - 1].room.Value.findIndex(f => f.id == fId);
        data[rId - 1].room.Value.splice(removedIndex, 1);
    }
    else {
        alert('Element can\'t be removed. ' + response.statusText);
    }
}
function changeFormHeader(header) {
    $('#add-form-header').empty();
    $('#add-form-header').append(header);
}

function changeFormDisplay(idv, namev, countv) {
    $('#fid').css('display', idv);
    $('#fname').css('display', namev);
    $('#fcount').css('display', countv);
}

async function formAdd() {
    let inc = $('input[name="f-add-count"]');
    let inn = $('input[name="f-add-name"]');
    if (inc.val().replace(' ', '').length == 0) return;
    let count = Number(inc.val());
    if (isNaN(count)) {
        alert('Field \"Count\" must be a number');
        return;
    }
    let index = $('.right-side').data('roomindex');
    let name = inn.val();
    await CreateFacilities(index, name, count);
    changeVis(false, '.add-form-data');
}

async function formEdit() {
    let ini = $('input[name="f-id"]');
    let inc = $('input[name="f-add-count"]');
    let inn = $('input[name="f-add-name"]');
    if (inc.val().replace(' ', '').length == 0 || ini.val().replace(' ', '').length == 0) return;
    let id = Number(ini.val());
    let count = Number(inc.val());
    if (isNaN(id)) {
        alert('Field "Id" must be a number');
        return;
    }
    if (isNaN(count)) {
        alert('Field "Count" must be a number');
        return;
    }
    let target = $('#f' + id);
    if (target.length == 0) {
        alert('There isn\'t any facilities with this id');
        return;
    }
    await EditFacilities(id, inn.val(), count);
    changeVis(false, '.add-form-data');
}

async function formRemove() {
    let ini = $('input[name="f-id"]');
    if (ini.val().replace(' ', '').length == 0) return;
    let id = Number(ini.val());
    if (isNaN(id)) {
        alert('Field "Id" must be a number');
        return;
    }
    let target = $('#f' + id);
    if (target.length == 0) {
        alert('There isn\'t any facilities with this id');
        return;
    }
    await RemoveFacilities(id);
}

function changeIndicator(selector, isempty) {
    if (isempty) {
        if ($(selector).hasClass('indicator-empty')) return;
        $(selector).removeClass('indicator-filled');
        $(selector).addClass('indicator-empty');
    }
    else {
        if ($(selector).hasClass('indicator-filled')) return;
        $(selector).removeClass('indicator-empty');
        $(selector).addClass('indicator-filled');
    }
}

function isIndicatorActive() {
    let bid = 1;
    let isBdEmpty = true;
    data.forEach(d => {
        if (bid != d.bid) {
            changeIndicator($('#b' + bid).find('.indicator').first(), isBdEmpty);
            bid = d.bid;
            isBdEmpty = true;
        }
        changeIndicator($('#r' + d.room.Key.id).find('.indicator'), (d.room.Value.length == 0));
        isBdEmpty &= (d.room.Value.length == 0);
    });
    changeIndicator($('#b' + bid).find('.indicator').first(), isBdEmpty);
}

let formSelectedAction;

GetBuildingsName().then(async (e) => {
    let bc = $('.building').length;
    for (var i = 1; i <= bc; i++) {
        let res = await GetBuildingsData(i);
        res.forEach(val => {
            data.push({ bid: i, room: val });
        })
    }
}).then(e => {
    $('.bclick').on('click', (o) => {
        changeVis(false, '.add-form');
        changeVis(false, '.add-form-data');
        changeSelection(o.currentTarget);
        $('.right-side').attr('data-roomindex', -1);
        $('.right-side-data').empty();
        data.forEach(d => {
            d.room.Value.forEach(f => $('.right-side-data').append(createF(f, d.room.Key.id)));
        });
    });
    $('.rclick').on('click', (o) => {
        changeVis(true, '.add-form');
        changeVis(false, '.add-form-data');
        changeSelection(o.currentTarget);
        let rindex = $(o.currentTarget).parent('.room').data('roomindex');
        $('.right-side').attr('data-roomindex', rindex);
        $('.right-side-data').empty();
        if (data[rindex - 1] == undefined) return;
        data[rindex - 1].room.Value.forEach(f => {
            $('.right-side-data').append(createF(f, data[rindex - 1].room.Key.id))
        });
    });
}).then(e => {
    $('.bclick').first().click();
    $('.building').each((b, el) => isIndicatorActive(el));
    document.getElementById("btnAdd").style.display = "block";
    $('#btnApply').on('click', async (o) => {
        if (formSelectedAction == 'add') {
            await formAdd();
            isIndicatorActive();
        }
        else if (formSelectedAction == 'edit') await formEdit();
        else if (formSelectedAction == 'remove') {
            await formRemove();
            isIndicatorActive();
        }
    });
    $('#btnAdd').on('click', (o) => {
        changeVis(true, '.add-form-data');
        changeFormHeader('Add facilities');
        changeFormDisplay('none', 'flex', 'flex');
        formSelectedAction = 'add';
    });
    $('#btnEdit').on('click', () => {
        changeVis(true, '.add-form-data');
        changeFormHeader('Edit facilities');
        $('#idData').css('display', 'flex');
        changeFormDisplay('flex', 'flex', 'flex');
        formSelectedAction = 'edit';
    });
    $('#btnRemove').on('click', () => {
        changeVis(true, '.add-form-data');
        changeFormHeader('Remove facilities');
        $('#idData').css('display', 'flex');
        changeFormDisplay('flex', 'none', 'none');
        formSelectedAction = 'remove'
    });
    $('#btnClose').on('click', (o) => {
        changeVis(false, '.add-form-data');
    });
});




