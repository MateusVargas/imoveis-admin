import Knex from 'knex'

export async function up(knex: Knex){
    return knex.schema.createTable('agendamentos', table => {
        table.increments('id').primary()
        table.string('mensagem').notNullable()
        table.string('situacao').notNullable().defaultTo('pendente')
        
        table.integer('id_imovel')
        	.notNullable()
        	.unsigned()
        	.references('id')
        	.inTable('imoveis')
        	.onDelete('cascade')
        	.onUpdate('cascade')

        table.integer('id_corretor')
        	.nullable()
        	.unsigned()
        	.references('id')
        	.inTable('corretores')
        	.onDelete('set null')
        	.onUpdate('cascade')
    })
}

export async function down(knex: Knex){
    return knex.schema.dropTable('agendamentos')
}