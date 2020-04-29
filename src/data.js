// 1
const tipologie_museali = [
    'Museo d\'Arte',
    'Musei di Storia e Archeologia',
    'Musei di Scienza e Tecnica',
    'Musei di Storia e Scienze Naturali',
    'Musei di Etnografia e Antropologia',
    'Musei Specializzati',
    'Musei Territoriali',
    'Musei Storici',
    'Monumenti Storici',
    'Aree e Parchi Archeologici',
    'Giardini Zoologici / Orti Botanici / Acquari e Riserve',
    'Altri'
];

// 2
const categorie = [
    'Musei Tradizionali',
    'Musei Multimediali',
    'Musei Virtuali'
];

// 3
const tipologie_espositive = [
    'Mostre Permanenti',
    'Mostre Temporanee',
    'Installazioni Permanenti',
    'Installazioni Temporanee'
];

// 4
const linguaggi_visivi = [
    'Filmati',
    'Animazioni',
    '3D: Ricostruzioni',
    '3D: Simulazioni',
    '3D: Serious Games',
    '3D: Panorami Sferici',
    'Panorami Statici',
    'Panorami Dinamici',
];

// 5
const output = [
    'Dispositivi Portatili',
    'Dispositivi Head Mount',
    'Dispositivi Fissi',
    'Superfici'
];

// 6
const tecniche_e_tecnologie = [
    'AR',
    'VR',
    'MR',
    'Web 3.0',
    'Sensori di Movimento',
    'Sensori Touch',
    'AR Analogica',
    'Video Mapping',
    'Video Proiezioni',
    'Gamification',
    'Guide (Video Augmented)'
];

// 7
const esperienza = [
    'Interattiva',
    'Immersiva',
    'Interattiva / Immersiva',
    'Non Interattiva'
];


// Limu root
let treeData = {
    'name': 'Limu',
    'category': '',
    'children': []
};

// Populate dataset
tipologie_museali.map(tm => {
    treeData.children.push({
        name: tm,
        category: 'Tipologie',
        _children: categorie.map(c => {
            return {
                name: c,
                category: 'Categorie',
                _children: tipologie_espositive.map(te => {
                    return {
                        name: te,
                        category: 'Tipologie Espositive',
                        _children: linguaggi_visivi.map(lv => {
                            return {
                                name: lv,
                                category: 'Linguaggi',
                                _children: output.map(o => {
                                    return {
                                        name: o,
                                        category: 'Output',
                                        _children: tecniche_e_tecnologie.map(tt => {
                                            return {
                                                name: tt,
                                                category: 'Tecnologie',
                                                _children: esperienza.map(e => {
                                                    return {
                                                        name: e,
                                                        category: 'Esperienza',
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })
});


