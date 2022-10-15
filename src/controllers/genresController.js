const {Op} = require('sequelize');
const db = require('../database/models');
const { createError } = require('../helpers');



module.exports = {
    list: async (req, res) => {

        let {limit, order} = req.query;
        let fields = ['name', 'ranking'];

        try {
           
            if(!fields.includes(order)){
                throw createError(400,"Solo se ordenan los campos por 'name' y 'ranking'");
            }
            let total = await db.Genre.count();
            let genres = await db.Genre.findAll({
                attributes : {
                    exclude : ['created_at', 'updated_at']
                },
                limit : limit ? +limit : 5,
                order : [order ? order : 'id']
            });
            return res.status(200).json({
                ok : true,
                meta : {
                    // perPage : genres.length,
                    status : 200
                },
                data :{
                    items : genres.length,
                    total,
                    genres
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok : false,
                msg : error.message
            })
        }

    },
    getById : async (req, res) => {
        const {id} = req.params

        try {

            if(isNaN(id)){ 
                throw createError(400, 'El ID debe ser un número');
            }

            let genre = await db.Genre.findByPk(req.params.id);

            if(!genre){
                throw createError(404,'No hay género con ese ID' );
                
            }

            return res.status(200).json({
                ok : true,
                meta : {
                    status : 200
                },
                data : {
                    genre,
                    total : 1
                }
            })
            
        
        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok : false,
                msg : error.message
            })
        }
    },
    getByname : async (req, res) => {

        const {name} = req.params;
    
        try {
            if(!name){
                throw createError(400,'El ID nombre es obligatorio' );

            }

        let genres = await db.Genre.findOne({
            where : {
                name : {
                    [Op.substring] : name
                }
            }
        })
    

        if(!genre){
            throw createError(404, 'No hay género con ese nombre');
        }

        } catch (error) {
            console.log(error)
            return res.status(error.status || 500).json({
                ok : false,
                msg : error.message
            })
        }
    }

}

