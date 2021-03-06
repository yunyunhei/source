
// Custom UI code

(function () {
	$.Msg( "The Auto Chess custom UI just loaded! ---------------------------------------------------------------------------------------------------------------------" );
})();

// Functions

function find_dota_hud_element(id){
    var hudRoot;
    var panel;
    for(panel=$.GetContextPanel();panel!=null;panel=panel.GetParent()){
        hudRoot = panel;
    }
    var comp = hudRoot.FindChildTraverse(id);
    return comp;
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

/*START-DRAWSTAT*/  

function getCurrentChamps() {

    //check if enemy is alive after a battle round
    if ( enemies_steam_ids) {
        for ( var i in enemies_steam_ids ) {
            //is dead, remove it
            if ( !Entities.IsAlive(enemies_steam_ids[i].entity) ) {
                enemies_steam_ids[i].is_dead = true;
            }
        }
    }

    var user_list = [];
    var enemy_list = [];

    $.Each(Entities.GetAllEntitiesByClassname('npc_dota_creature'), function(entity) {
        var unit_name = Entities.GetUnitName(entity);
        if ( !unit_name.match(/chess/) ) {
            return;
        }

        var unit_team = Entities.GetTeamNumber(entity);

        if ( local_player_team == unit_team ) {
            user_list.push(unit_name);
        } else {
            //check if enemy still exists and is alive
            if ( !enemies_steam_ids || !enemies_steam_ids[unit_team] ) {
                return;
            }
            enemy_list.push(unit_name);
        }
    });

    var hero_list = user_list.concat(enemy_list);
    var hero_one_star_list = [];

    $.Each(hero_list, function(item) {
        var hero_det = hero_dict[item];

        if (hero_det['level'] == 1) {
            hero_one_star_list.push(hero_det['name']);
        } else if (hero_det['level'] == 2) {
            for(var i=0; i < 3; i++){
                hero_one_star_list.push(hero_det['name']);
            }            
        } else {
            for(var i=0; i < 9; i++){
                hero_one_star_list.push(hero_det['name']);
            }            
        }

    });

    var counts = {};

    for (var i = 0; i < hero_one_star_list.length; i++) {
        var num = hero_one_star_list[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    return counts
};

function get_total_size_of_pool(hero_counts_input, courier_level_input) {
    var size_total_pool = 0;

    $.Each(hero_id_list, function(item) {
        var tmp_ele = find_dota_hud_element(item);
        if (tmp_ele) {
            var tmp_cost = hero_dict[item]['cost'];
            var tmp_hero_pool = hero_pool_counts[tmp_cost];
            var tmp_threshold = level_thresholds[tmp_cost];
            var champ_name = hero_dict[item]['name'];
    
            if (champ_name in hero_counts_input) {
                var hero_in_play = hero_counts_input[champ_name];
            } else {
                var hero_in_play = 0
            }

            if (!courier_level_input) {
                courier_level_input = 1
            }

            if (courier_level_input >= tmp_threshold) {
                size_total_pool = size_total_pool + (tmp_hero_pool - hero_in_play);
            } 
        } 
    });

    return size_total_pool; 
}

function calculate_draw_prop(champ_input, hero_counts_input, courier_level_input, size_total_pool_input) {
    var tmp_cost = hero_dict[champ_input]['cost'];
    var tmp_hero_pool = hero_pool_counts[tmp_cost];
    var tmp_threshold = level_thresholds[tmp_cost];
    var champ_name = hero_dict[champ_input]['name'];

    if (champ_name in hero_counts_input) {
        var hero_in_play = hero_counts_input[champ_name];
    } else {
        var hero_in_play = 0
    }

    if (!courier_level_input) {
        courier_level_input = 1
    }

    if (courier_level_input >= tmp_threshold) {
        var num_hero_avail = tmp_hero_pool - hero_in_play;
        var num_bad_draws = size_total_pool_input - num_hero_avail;
        var prop_at_least_one = 1 - ((num_bad_draws / size_total_pool_input) * ((num_bad_draws - 1) / (size_total_pool_input - 1)) * ((num_bad_draws - 2) / (size_total_pool_input - 2)) * ((num_bad_draws - 3) / (size_total_pool_input - 3)) * ((num_bad_draws - 4) / (size_total_pool_input - 4)));
    } else {
        var prop_at_least_one = 0;
    }

    return Math.round(prop_at_least_one * 100 * 10) / 10;        
}

/*END-DRAWSTAT*/ 

// Data inputs

var tier_dict = {'Abaddon': 'C',
'Alchemist': 'D',
'Anti-mage': 'S',
'Axe': 'D',
'Batrider': 'E',
'Beastmaster': 'C',
'Bounty Hunter': 'S',
'Chaos Knight': 'B',
'Clockwerk': 'A',
'Crystal Maiden': 'B',
'Death Prophet': 'B',
'Disruptor': 'B',
'Doom': 'S',
'Dragon Knight': 'A',
'Drow Ranger': 'C',
'Enchantress': 'D',
'Enigma': 'A',
'Furion': 'D',
'Gyrocopter': 'C',
'Juggernaut': 'C',
'Keeper of the Light': 'B',
'Kunkka': 'A',
'Lich': 'C',
'Lina': 'D',
'Lone Druid': 'S',
'Luna': 'C',
'Lycan': 'B',
'Mars': 'D',
'Medusa': 'S',
'Mirana': 'D',
'Morphling': 'C',
'Necrophos': 'A',
'Ogre Magi': 'D',
'Omniknight': 'B',
'Phantom Assassin': 'B',
'Puck': 'D',
'Queen of Pain': 'B',
'Razor': 'S',
'Shadow Fiend': 'B',
'Shadow Shaman': 'E',
'Slardar': 'C',
'Sniper': 'C',
'Techies': 'A',
'Templar Assassin': 'B',
'Terrorblade': 'D',
'Tidehunter': 'S',
'Timbersaw': 'A',
'Tinker': 'C',
'Tiny': 'B',
'Treant Protector': 'B',
'Troll Warlord': 'B',
'Tusk': 'C',
'Venomancer': 'C',
'Viper': 'C',
'Windranger': 'C',
'Witch Doctor': 'C',
'Zeus': 'A'}

// Death Prophet (5), Treant (3), Mirana (2), Crystal Maiden (2)  might be wrong cost!

var hero_dict = {'chess_abaddon': {'cost': 3, 'level': 1, 'name': 'Abaddon'},
'chess_abaddon1': {'cost': 3, 'level': 2, 'name': 'Abaddon'},
'chess_abaddon11': {'cost': 3, 'level': 3, 'name': 'Abaddon'},
'chess_am': {'cost': 1, 'level': 1, 'name': 'Anti-mage'},
'chess_am1': {'cost': 1, 'level': 2, 'name': 'Anti-mage'},
'chess_am11': {'cost': 1, 'level': 3, 'name': 'Anti-mage'},
'chess_axe': {'cost': 1, 'level': 1, 'name': 'Axe'},
'chess_axe1': {'cost': 1, 'level': 2, 'name': 'Axe'},
'chess_axe11': {'cost': 1, 'level': 3, 'name': 'Axe'},
'chess_bat': {'cost': 1, 'level': 1, 'name': 'Batrider'},
'chess_bat1': {'cost': 1, 'level': 2, 'name': 'Batrider'},
'chess_bat11': {'cost': 1, 'level': 3, 'name': 'Batrider'},
'chess_bh': {'cost': 1, 'level': 1, 'name': 'Bounty Hunter'},
'chess_bh1': {'cost': 1, 'level': 2, 'name': 'Bounty Hunter'},
'chess_bh11': {'cost': 1, 'level': 3, 'name': 'Bounty Hunter'},
'chess_bm': {'cost': 2, 'level': 1, 'name': 'Beastmaster'},
'chess_bm1': {'cost': 2, 'level': 2, 'name': 'Beastmaster'},
'chess_bm11': {'cost': 2, 'level': 3, 'name': 'Beastmaster'},
'chess_ck': {'cost': 2, 'level': 1, 'name': 'Chaos Knight'},
'chess_ck1': {'cost': 2, 'level': 2, 'name': 'Chaos Knight'},
'chess_ck11': {'cost': 2, 'level': 3, 'name': 'Chaos Knight'},
'chess_clock': {'cost': 1, 'level': 1, 'name': 'Clockwerk'},
'chess_clock1': {'cost': 1, 'level': 2, 'name': 'Clockwerk'},
'chess_clock11': {'cost': 1, 'level': 3, 'name': 'Clockwerk'},
'chess_cm': {'cost': 2, 'level': 1, 'name': 'Crystal Maiden'},
'chess_cm1': {'cost': 2, 'level': 2, 'name': 'Crystal Maiden'},
'chess_cm11': {'cost': 2, 'level': 3, 'name': 'Crystal Maiden'},
'chess_disruptor': {'cost': 4, 'level': 1, 'name': 'Disruptor'},
'chess_disruptor1': {'cost': 4, 'level': 2, 'name': 'Disruptor'},
'chess_disruptor11': {'cost': 4, 'level': 3, 'name': 'Disruptor'},
'chess_dk': {'cost': 4, 'level': 1, 'name': 'Dragon Knight'},
'chess_dk1': {'cost': 4, 'level': 2, 'name': 'Dragon Knight'},
'chess_dk11': {'cost': 4, 'level': 3, 'name': 'Dragon Knight'},
'chess_doom': {'cost': 4, 'level': 1, 'name': 'Doom'},
'chess_doom1': {'cost': 4, 'level': 2, 'name': 'Doom'},
'chess_doom11': {'cost': 4, 'level': 3, 'name': 'Doom'},
'chess_dp': {'cost': 5, 'level': 1, 'name': 'Death'},
'chess_dp1': {'cost': 5, 'level': 2, 'name': 'Death'},
'chess_dp11': {'cost': 5, 'level': 3, 'name': 'Death'},
'chess_dr': {'cost': 1, 'level': 1, 'name': 'Drow Ranger'},
'chess_dr1': {'cost': 1, 'level': 2, 'name': 'Drow Ranger'},
'chess_dr11': {'cost': 1, 'level': 3, 'name': 'Drow Ranger'},
'chess_eh': {'cost': 1, 'level': 1, 'name': 'Enchantress'},
'chess_eh1': {'cost': 1, 'level': 2, 'name': 'Enchantress'},
'chess_eh11': {'cost': 1, 'level': 3, 'name': 'Enchantress'},
'chess_enigma': {'cost': 5, 'level': 1, 'name': 'Enigma'},
'chess_enigma1': {'cost': 5, 'level': 2, 'name': 'Enigma'},
'chess_enigma11': {'cost': 5, 'level': 3, 'name': 'Enigma'},
'chess_fur': {'cost': 2, 'level': 1, 'name': 'Furion'},
'chess_fur1': {'cost': 2, 'level': 2, 'name': 'Furion'},
'chess_fur11': {'cost': 2, 'level': 3, 'name': 'Furion'},
'chess_ga': {'cost': 4, 'level': 1, 'name': 'Alchemist'},
'chess_ga1': {'cost': 4, 'level': 2, 'name': 'Alchemist'},
'chess_ga11': {'cost': 4, 'level': 3, 'name': 'Alchemist'},
'chess_gyro': {'cost': 5, 'level': 1, 'name': 'Gyrocopter'},
'chess_gyro1': {'cost': 5, 'level': 2, 'name': 'Gyrocopter'},
'chess_gyro11': {'cost': 5, 'level': 3, 'name': 'Gyrocopter'},
'chess_jugg': {'cost': 2, 'level': 1, 'name': 'Juggernaut'},
'chess_jugg1': {'cost': 2, 'level': 2, 'name': 'Juggernaut'},
'chess_jugg11': {'cost': 2, 'level': 3, 'name': 'Juggernaut'},
'chess_kael': {'cost': 1, 'level': 1, 'name': 'Invoker'},
'chess_kael1': {'cost': 1, 'level': 2, 'name': 'Invoker'},
'chess_kael11': {'cost': 1, 'level': 3, 'name': 'Invoker'},
'chess_kunkka': {'cost': 4, 'level': 1, 'name': 'Kunkka'},
'chess_kunkka1': {'cost': 4, 'level': 2, 'name': 'Kunkka'},
'chess_kunkka11': {'cost': 4, 'level': 3, 'name': 'Kunkka'},
'chess_ld': {'cost': 4, 'level': 1, 'name': 'Lone Druid'},
'chess_ld1': {'cost': 4, 'level': 2, 'name': 'Lone Druid'},
'chess_ld11': {'cost': 4, 'level': 3, 'name': 'Lone Druid'},
'chess_lich': {'cost': 5, 'level': 1, 'name': 'Lich'},
'chess_lich1': {'cost': 5, 'level': 2, 'name': 'Lich'},
'chess_lich11': {'cost': 5, 'level': 3, 'name': 'Lich'},
'chess_light': {'cost': 4, 'level': 1, 'name': 'Keeper of the Light'},
'chess_light1': {'cost': 4, 'level': 2, 'name': 'Keeper of the Light'},
'chess_light11': {'cost': 4, 'level': 3, 'name': 'Keeper of the Light'},
'chess_lina': {'cost': 3, 'level': 1, 'name': 'Lina'},
'chess_lina1': {'cost': 3, 'level': 2, 'name': 'Lina'},
'chess_lina11': {'cost': 3, 'level': 3, 'name': 'Lina'},
'chess_luna': {'cost': 2, 'level': 1, 'name': 'Luna'},
'chess_luna1': {'cost': 2, 'level': 2, 'name': 'Luna'},
'chess_luna11': {'cost': 2, 'level': 3, 'name': 'Luna'},
'chess_lyc': {'cost': 3, 'level': 1, 'name': 'Lycan'},
'chess_lyc1': {'cost': 3, 'level': 2, 'name': 'Lycan'},
'chess_lyc11': {'cost': 3, 'level': 3, 'name': 'Lycan'},
'chess_mars': {'cost': 1, 'level': 1, 'name': 'Mars'},
'chess_mars1': {'cost': 1, 'level': 2, 'name': 'Mars'},
'chess_mars11': {'cost': 1, 'level': 3, 'name': 'Mars'},
'chess_medusa': {'cost': 4, 'level': 1, 'name': 'Medusa'},
'chess_medusa1': {'cost': 4, 'level': 2, 'name': 'Medusa'},
'chess_medusa11': {'cost': 4, 'level': 3, 'name': 'Medusa'},
'chess_morph': {'cost': 2, 'level': 1, 'name': 'Morphling'},
'chess_morph1': {'cost': 2, 'level': 2, 'name': 'Morphling'},
'chess_morph11': {'cost': 2, 'level': 3, 'name': 'Morphling'},
'chess_nec': {'cost': 4, 'level': 1, 'name': 'Necrophos'},
'chess_nec1': {'cost': 4, 'level': 2, 'name': 'Necrophos'},
'chess_nec11': {'cost': 4, 'level': 3, 'name': 'Necrophos'},
'chess_ok': {'cost': 3, 'level': 1, 'name': 'Omniknight'},
'chess_ok1': {'cost': 3, 'level': 2, 'name': 'Omniknight'},
'chess_ok11': {'cost': 3, 'level': 3, 'name': 'Omniknight'},
'chess_om': {'cost': 1, 'level': 1, 'name': 'Ogre Magi'},
'chess_om1': {'cost': 1, 'level': 2, 'name': 'Ogre Magi'},
'chess_om11': {'cost': 1, 'level': 3, 'name': 'Ogre Magi'},
'chess_pa': {'cost': 3, 'level': 1, 'name': 'Phantom Assassin'},
'chess_pa1': {'cost': 3, 'level': 2, 'name': 'Phantom Assassin'},
'chess_pa11': {'cost': 3, 'level': 3, 'name': 'Phantom Assassin'},
'chess_pom': {'cost': 2, 'level': 1, 'name': 'Mirana'},
'chess_pom1': {'cost': 2, 'level': 2, 'name': 'Mirana'},
'chess_pom11': {'cost': 2, 'level': 3, 'name': 'Mirana'},
'chess_puck': {'cost': 2, 'level': 1, 'name': 'Puck'},
'chess_puck1': {'cost': 2, 'level': 2, 'name': 'Puck'},
'chess_puck11': {'cost': 2, 'level': 3, 'name': 'Puck'},
'chess_qop': {'cost': 2, 'level': 1, 'name': 'Queen of Pain'},
'chess_qop1': {'cost': 2, 'level': 2, 'name': 'Queen of Pain'},
'chess_qop11': {'cost': 2, 'level': 3, 'name': 'Queen of Pain'},
'chess_razor': {'cost': 3, 'level': 1, 'name': 'Razor'},
'chess_razor1': {'cost': 3, 'level': 2, 'name': 'Razor'},
'chess_razor11': {'cost': 3, 'level': 3, 'name': 'Razor'},
'chess_riki': {'cost': 1, 'level': 1, 'name': 'Riki'},
'chess_riki1': {'cost': 1, 'level': 2, 'name': 'Riki'},
'chess_riki11': {'cost': 1, 'level': 3, 'name': 'Riki'},
'chess_sf': {'cost': 3, 'level': 1, 'name': 'Shadow Fiend'},
'chess_sf1': {'cost': 3, 'level': 2, 'name': 'Shadow Fiend'},
'chess_sf11': {'cost': 3, 'level': 3, 'name': 'Shadow Fiend'},
'chess_shredder': {'cost': 2, 'level': 1, 'name': 'Timbersaw'},
'chess_shredder1': {'cost': 2, 'level': 2, 'name': 'Timbersaw'},
'chess_shredder11': {'cost': 2, 'level': 3, 'name': 'Timbersaw'},
'chess_sk': {'cost': 1, 'level': 1, 'name': 'Sand King'},
'chess_sk1': {'cost': 1, 'level': 2, 'name': 'Sand King'},
'chess_sk11': {'cost': 1, 'level': 3, 'name': 'Sand King'},
'chess_slardar': {'cost': 2, 'level': 1, 'name': 'Slardar'},
'chess_slardar1': {'cost': 2, 'level': 2, 'name': 'Slardar'},
'chess_slardar11': {'cost': 2, 'level': 3, 'name': 'Slardar'},
'chess_slark': {'cost': 1, 'level': 1, 'name': 'Slark'},
'chess_slark1': {'cost': 1, 'level': 2, 'name': 'Slark'},
'chess_slark11': {'cost': 1, 'level': 3, 'name': 'Slark'},
'chess_sniper': {'cost': 3, 'level': 1, 'name': 'Sniper'},
'chess_sniper1': {'cost': 3, 'level': 2, 'name': 'Sniper'},
'chess_sniper11': {'cost': 3, 'level': 3, 'name': 'Sniper'},
'chess_ss': {'cost': 1, 'level': 1, 'name': 'Shadow Shaman'},
'chess_ss1': {'cost': 1, 'level': 2, 'name': 'Shadow Shaman'},
'chess_ss11': {'cost': 1, 'level': 3, 'name': 'Shadow Shaman'},
'chess_sven': {'cost': 1, 'level': 1, 'name': 'Sven'},
'chess_sven1': {'cost': 1, 'level': 2, 'name': 'Sven'},
'chess_sven11': {'cost': 1, 'level': 3, 'name': 'Sven'},
'chess_ta': {'cost': 4, 'level': 1, 'name': 'Templar Assassin'},
'chess_ta1': {'cost': 4, 'level': 2, 'name': 'Templar Assassin'},
'chess_ta11': {'cost': 4, 'level': 3, 'name': 'Templar Assassin'},
'chess_tb': {'cost': 3, 'level': 1, 'name': 'Terrorblade'},
'chess_tb1': {'cost': 3, 'level': 2, 'name': 'Terrorblade'},
'chess_tb11': {'cost': 3, 'level': 3, 'name': 'Terrorblade'},
'chess_tech': {'cost': 5, 'level': 1, 'name': 'Techies'},
'chess_tech1': {'cost': 5, 'level': 2, 'name': 'Techies'},
'chess_tech11': {'cost': 5, 'level': 3, 'name': 'Techies'},
'chess_th': {'cost': 5, 'level': 1, 'name': 'Tidehunter'},
'chess_th1': {'cost': 5, 'level': 2, 'name': 'Tidehunter'},
'chess_th11': {'cost': 5, 'level': 3, 'name': 'Tidehunter'},
'chess_tiny': {'cost': 1, 'level': 1, 'name': 'Tiny'},
'chess_tiny1': {'cost': 1, 'level': 2, 'name': 'Tiny'},
'chess_tiny11': {'cost': 1, 'level': 3, 'name': 'Tiny'},
'chess_tk': {'cost': 1, 'level': 1, 'name': 'Tinker'},
'chess_tk1': {'cost': 1, 'level': 2, 'name': 'Tinker'},
'chess_tk11': {'cost': 1, 'level': 3, 'name': 'Tinker'},
'chess_tp': {'cost': 3, 'level': 1, 'name': 'Treant Protector'},
'chess_tp1': {'cost': 3, 'level': 2, 'name': 'Treant Protector'},
'chess_tp11': {'cost': 3, 'level': 3, 'name': 'Treant Protector'},
'chess_troll': {'cost': 4, 'level': 1, 'name': 'Troll Warlord'},
'chess_troll1': {'cost': 4, 'level': 2, 'name': 'Troll Warlord'},
'chess_troll11': {'cost': 4, 'level': 3, 'name': 'Troll Warlord'},
'chess_tusk': {'cost': 1, 'level': 1, 'name': 'Tusk'},
'chess_tusk1': {'cost': 1, 'level': 2, 'name': 'Tusk'},
'chess_tusk11': {'cost': 1, 'level': 3, 'name': 'Tusk'},
'chess_veno': {'cost': 3, 'level': 1, 'name': 'Venomancer'},
'chess_veno1': {'cost': 3, 'level': 2, 'name': 'Venomancer'},
'chess_veno11': {'cost': 3, 'level': 3, 'name': 'Venomancer'},
'chess_viper': {'cost': 3, 'level': 1, 'name': 'Viper'},
'chess_viper1': {'cost': 3, 'level': 2, 'name': 'Viper'},
'chess_viper11': {'cost': 3, 'level': 3, 'name': 'Viper'},
'chess_wd': {'cost': 2, 'level': 1, 'name': 'Witch Doctor'},
'chess_wd1': {'cost': 2, 'level': 2, 'name': 'Witch Doctor'},
'chess_wd11': {'cost': 2, 'level': 3, 'name': 'Witch Doctor'},
'chess_wr': {'cost': 3, 'level': 1, 'name': 'Windranger'},
'chess_wr1': {'cost': 3, 'level': 2, 'name': 'Windranger'},
'chess_wr11': {'cost': 3, 'level': 3, 'name': 'Windranger'},
'chess_zeus': {'cost': 5, 'level': 1, 'name': 'Zeus'},
'chess_zeus1': {'cost': 5, 'level': 2, 'name': 'Zeus'},
'chess_zeus11': {'cost': 5, 'level': 3, 'name': 'Zeus'}};

var round_descriptions = {
    1 : '2 Creeps',
    2 : '3 Creeps',
    3 : '5 Creeps',
    10 : 'Stone Golems', 
    15 : 'Jumping Wolfs',
    20 : 'Hellbears', 
    25 : 'Wildwings',
    30 : 'Big cows',
    35 : 'Black Dragon', 
    40 : 'Trolls',
    45 : 'Yearbeast',
    50 : 'Roshan'
};

var hero_id_list = [];
for (var key in hero_dict) {
    if (hero_dict.hasOwnProperty(key)) {
        var name_stripped = key.replace(/1/g, '');
        if (!isInArray(name_stripped, hero_id_list)) {
            hero_id_list.push(name_stripped);
        }    
    }
}

var DISPLAY_TIER = true;
var DISPLAY_DRAW_PROB = true;

var hero_pool_counts = {1 : 45, 2 : 30, 3 : 25, 4 : 15, 5 : 10};
var level_thresholds = {1 : 1, 2 : 2, 3 : 3, 4 : 5, 5 : 8};

var local_player_team;
var user_steam_id;
var courier_id, previous_courier_level, previous_courier_xp;
var enemies_steam_ids = {};
var hero_counts = {};
var first_time = true;

function OnShowTime(keys) {
    if (first_time) {

        // Get player info
        local_player_team = Players.GetTeam(Players.GetLocalPlayer());
        user_steam_id = Game.GetPlayerInfo(Players.GetLocalPlayer()).player_steamid;
        $.Msg('Steam ID:')
        $.Msg(user_steam_id)

        //get courier id and enemies steam_ids
        $.Each(Entities.GetAllHeroEntities(), function(entity) {
            var team = Entities.GetTeamNumber(entity);
            if ( local_player_team == team ) {
                courier_id = entity;
                return;
            }

            enemies_steam_ids[team] = {
                steam_id: Game.GetPlayerInfo(Entities.GetPlayerOwnerID(entity)).steam_id,
                entity: entity,
                is_dead: false,
            };
        });

        // Make space for Tier indicator

        find_dota_hud_element('panel_hero_draw_card_0').GetParent().style['height'] = '380px';

        var times = 5;
        for(var i=0; i < times; i++){
            find_dota_hud_element('panel_hero_draw_card_' + i).style['height'] = '380px';
        }

        // Add gold indicator

        var parentPanelPortrait = find_dota_hud_element('minimap_container');
        var template_gold = '<Label text="1xp (5 gold) for lvl up" id="gold_text" style="font-size: 22px; font-weight: bold; margin-left: 15px; margin-top: -5px;"/>';
        parentPanelPortrait.BCreateChildren(template_gold);  

        // End

        first_time = false;

    }

    // Get current picked

    /*START-DRAWSTAT*/  

    hero_counts = getCurrentChamps();
    var size_total_pool = get_total_size_of_pool(hero_counts, courier_level);

    /*END-DRAWSTAT*/ 

    // Add Tier + Probability

    var times = 5;
    for(var i=0; i < times; i++){
        var champ_name = find_dota_hud_element('panel_hero_draw_card_' + i).FindChild('text_draw_card_' + i).text.replace('★', '').trim();
        var champ_tier = tier_dict[champ_name];
        var parentPanel = find_dota_hud_element('panel_hero_draw_card_' + i);
        var costPanel = parentPanel.FindChild('text_draw_card_price_' + i);
        var hero_cost = parseInt(costPanel.text.replace('×', ''));
        var hero_pool = hero_pool_counts[hero_cost];

        /*START-DRAWSTAT*/  

        if (champ_name in hero_counts) {
            var hero_in_play = hero_counts[champ_name];
        } else {
            var hero_in_play = 0
        }

        var num_hero_avail = hero_pool - hero_in_play;
        var num_bad_draws = size_total_pool - num_hero_avail;
        var prop_at_least_one = 1 - ((num_bad_draws / size_total_pool) * ((num_bad_draws - 1) / (size_total_pool - 1)) * ((num_bad_draws - 2) / (size_total_pool - 2)) * ((num_bad_draws - 3) / (size_total_pool - 3)) * ((num_bad_draws - 4) / (size_total_pool - 4)));

        var hero_perc_avail = Math.round(prop_at_least_one * 100);

        if (!champ_tier) {
            champ_tier = '?';
        }

        /*END-DRAWSTAT*/ 
        
        if (DISPLAY_DRAW_PROB && DISPLAY_TIER) {
            var template = '<Label text="' + champ_tier + ' (' + hero_in_play + ' / ' + hero_perc_avail + '%)" id="rank_draw_card_' + i + '" style = "font-size: 26px; font-weight: bold; width: 250px; text-align: center; margin-top: 333px; margin-left: 15px; z-index: 600;"/> ';
        } else if (DISPLAY_DRAW_PROB) {
            var template = '<Label text="(' + hero_in_play + ' / ' + hero_perc_avail + '%)" id="rank_draw_card_' + i + '" style = "font-size: 26px; font-weight: bold; width: 250px; text-align: center; margin-top: 333px; margin-left: 15px; z-index: 600;"/> ';
        } else {
            var template = '<Label text=" " id="rank_draw_card_' + i + '" style = "font-size: 26px; font-weight: bold; width: 250px; text-align: center; margin-top: 333px; margin-left: 15px; z-index: 600;"/> ';
        }

        if (!find_dota_hud_element('panel_hero_draw_card_' + i).FindChild('rank_draw_card_' + i)) {
            parentPanel.BCreateChildren(template);
        } else {
            if (DISPLAY_DRAW_PROB && DISPLAY_TIER) {
                find_dota_hud_element('rank_draw_card_' + i).text = champ_tier + ' (' + hero_in_play + ' / ' + hero_perc_avail + '%)';
            } else if (DISPLAY_DRAW_PROB) {
                find_dota_hud_element('rank_draw_card_' + i).text = '(' + hero_in_play + ' / ' + hero_perc_avail + '%)';
            } else {
                find_dota_hud_element('rank_draw_card_' + i).text = " ";
            }
        }
    }
    
    // Add element to display gold

    var courier_level = Entities.GetLevel(courier_id);
    var courier_xp = Entities.GetNeededXPToLevel(courier_id) - Entities.GetCurrentXP(courier_id);
    if ( courier_level != previous_courier_level || courier_xp != previous_courier_xp ) {
        previous_courier_level = courier_level;
        previous_courier_xp = courier_xp;
    }

    find_dota_hud_element('minimap_container').FindChild('gold_text').text = courier_xp + 'xp (' + Math.ceil(courier_xp/4)*5 + ' gold) for lvl up';

}

function OnBattleInfo(data) {
    var cur_round = data.round;

    /*
    if (!find_dota_hud_element('minimap_container').FindChild('round_warn_text')) {
        var parentPanelPortrait = find_dota_hud_element('minimap_container');
        var template_round_warn = '<Label text=" " id="round_warn_text" style="font-size: 35px; font-weight: bold; margin-left: 265px; margin-top: 220px; color: red;"/>';
        parentPanelPortrait.BCreateChildren(template_round_warn);     
    } 
    */

    if (!find_dota_hud_element('CustomUIContainer_Hud').FindChild('pve_warning')) {
        find_dota_hud_element('winstreak').style['width'] = '100%';
        var parentLabel = find_dota_hud_element('CustomUIContainer_Hud');
        var template_pve_warning = '<Label text=" " id="pve_warning" class="invisible" style="font-size: 35px; font-weight: bold; text-align: center; width: 100%; margin-top: 78%; color: #ff8888;"/>';
        parentLabel.BCreateChildren(template_pve_warning);
    }

    if (cur_round in round_descriptions) {
        /*
        find_dota_hud_element('minimap_container').FindChild('round_warn_text').text = 'Now: ' + round_descriptions[cur_round];
        find_dota_hud_element('minimap_container').FindChild('round_warn_text').style['color'] = 'red';
        */

        if (cur_round > 3 && data.type == 'prepare') {
            var pve_warning_ele = find_dota_hud_element('pve_warning');

            pve_warning_ele.text = 'PVE ROUND: ' + round_descriptions[cur_round];
            pve_warning_ele.SetHasClass('invisible',false);
    
            pve_warning_ele.style['transform'] = 'scale3d( 1.5, 1.5, 1.5)';
            $.Schedule(0.3,function(){
                pve_warning_ele.style['transform'] = 'scale3d( 1,1,1)';
            });
    
            var effects;
    
            Game.EmitSound("announcer_announcer_mega_now_enm", 500, 100, 1);
            effects = Particles.CreateParticle("particles/econ/events/killbanners/screen_killbanner_compendium14_rampage.vpcf",6,0)
            $.Schedule(5,function(){
                Particles.DestroyParticleEffect(effects,true)
            })
        }

    } else {
        find_dota_hud_element('pve_warning').SetHasClass('invisible',true);
        find_dota_hud_element('pve_warning').text = '';
        //find_dota_hud_element('minimap_container').FindChild('round_warn_text').text = 'Now: ' + 'PvP';
        //find_dota_hud_element('minimap_container').FindChild('round_warn_text').style['color'] = 'green';
    }

    // Add probabilities to list

    /*START-DRAWSTAT*/  

    if (cur_round > 0) {
        var hero_counts_round = getCurrentChamps();
        var courier_level_round = Entities.GetLevel(courier_id);
        var size_total_pool_round = get_total_size_of_pool(hero_counts_round, courier_level_round);
    
        $.Each(hero_id_list, function(item) {
            var tmp_ele = find_dota_hud_element(item);
            if (tmp_ele) {
                var hero_perc_avail = calculate_draw_prop(item, hero_counts_round, courier_level_round, size_total_pool_round);
                tmp_ele.text = hero_perc_avail + '%';
            } 
        });
    }

    /*END-DRAWSTAT*/  


};

(function()
{
    GameEvents.Subscribe("show_time", OnShowTime);
    GameEvents.Subscribe( "battle_info", OnBattleInfo );
})();