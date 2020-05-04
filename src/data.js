// 1
let tipologie_museali = [
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
let categorie = [
    'Musei Tradizionali',
    'Musei Multimediali',
    'Musei Virtuali'
];

// 3
let tipologie_espositive = [
    'Mostre Permanenti',
    'Mostre Temporanee',
    'Installazioni Permanenti',
    'Installazioni Temporanee'
];

// 4
let modalita_rappresentazione = [
    'Bidimensionale',
    'Tridimensionale'
];

// 5
let linguaggi_visivi = [
    'Filmati',
    'Animazioni',
    'Ricostruzioni',
    'Simulazioni',
    'Serious Games / Gamification',
    'Panorami Sferici 3D',
    'Panorami Statici',
    'Panorami Dinamici',
    'Guide',
];

// 6
let output = [
    'Dispositivi Portatili',
    'Dispositivi Head Mount',
    'Dispositivi Fissi',
    'Superfici'
];

// 7
let tecniche_e_tecnologie = [
    'Realtà Aumentata',
    'Realtà Virtuale',
    'Realtà Mista',
    'Web 3.0',
    'Sensori di Movimento',
    'Dispositivi Touch',
    'Realtà Aumentata Analogica',
    'Video Mapping',
    'Video Proiezioni',
    'Immagini stereoscopiche',
    'App'
];

// 8
let esperienza = [
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
        _children: categorie.filter(c => {
            if (tm === 'Musei di Storia e Archeologia') {
                return c  !== 'Musei Virtuali';
            } else {
                return c;
            }
        }).map(c => {
            return {
                name: c,
                category: 'Categorie',
                _children: tipologie_espositive.map(te => {
                    return {
                        name: te,
                        category: 'Tipologie Espositive',
                        _children: modalita_rappresentazione.map(mr => {
                            return {
                                name: mr,
                                category: 'Rappresentazione',
                                _children: linguaggi_visivi.filter(lv => {
                                    if (mr === 'Tridimensionale') {
                                        return lv !== 'Panorami Statici' && lv !== 'Panorami Dinamici' && lv !== 'Guide';
                                    } else {
                                        return lv;
                                    }
                                }).map(lv => {
                                    return {
                                        name: lv,
                                        category: 'Linguaggi',
                                        _children: tecniche_e_tecnologie.filter(tt => {
                                            if (lv === 'Ricostruzioni') {
                                                return tt !== 'Sensori di Movimento' && tt !== 'Dispositivi Touch' && tt !== 'Realtà Aumentata Analogica';
                                            } else {
                                                return tt;
                                            }
                                        }).map(tt => {
                                            return {
                                                name: tt,
                                                category: 'Tecnologie',
                                                _children: output.filter(o => {
                                                    if (tt === 'Realtà Virtuale') {
                                                        return o !== 'Superfici';
                                                    } else {
                                                        return o;
                                                    }
                                                }).map(o => {
                                                    return {
                                                        name: o,
                                                        category: 'Output',
                                                        _children: esperienza.filter(e => {
                                                            if (o === 'Dispositivi Head Mount') {
                                                                return e !== 'Interattiva';
                                                            } else {
                                                                return e;
                                                            }
                                                        }).map(e => {
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
            }
        })
    })
});


