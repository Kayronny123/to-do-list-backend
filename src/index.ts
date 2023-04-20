import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TTasksDB, TUserDB } from './types'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})
app.get("/ping", async (req: Request, res: Response) => {
    try {
        res.status(200).send({ message: "Pong!"})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        if(searchTerm === undefined){
            const result = await db("users")
            res.status(200).send(result)
        } else {
            const result = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)      
        }
          } catch (error) {
        console.log(error)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
       const {id, name, email, password} = req.body
      
        if(typeof id !== "string"){
            res.status(400)
            throw new Error("id deve ser string")
        }

        if(id.length < 4){
            res.status(400)
            throw new Error("id deve possuir pelo menos 4 caracteres")
        }
        if(typeof name !== "string"){
            res.status(400)
            throw new Error("Nome deve ser string")
        }
        if(name.length < 10){
            res.status(400)
            throw new Error("O nome deve possuir pelo menos 10 caracteres")
        }
        if(typeof email !== "string"){
            res.status(400)
            throw new Error("email deve ser string")
        }
        if(email.length < 10){
            res.status(400)
            throw new Error("O nome deve possuir pelo menos 10 caracteres")
        }
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}
        const [idAlreadyExtist]: TUserDB[]  = await db("users").where({id})
        if(idAlreadyExtist){
            res.status(400)
            throw new Error("Id já existe")
        }
        const [emailAlreadyExtist]: TUserDB[] = await db("users").where({email})
        if(emailAlreadyExtist){
            res.status(400)
            throw new Error("Email já existe")
        }

        const newUser: TUserDB ={
            id,
            name,
            email,
            password
        }

        await db("users").insert(newUser)
        res.status(201).send({
            message: "Usuario criado com sucesso",
            user: newUser
    })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
app.delete("/users/:id", async (req: Request, res: Response) => {
    try {
        const idDelete = req.params.id
        const [idAlreadyExist]: TUserDB[] = await db("users").where({id: idDelete})
        if(!idAlreadyExist){
            res.status(404)
            throw new Error("Id não encontrado")
        }
        await db("users").del().where({id: idDelete})
        res.status(200).send({message: "Usuario deletado com sucesso"})

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.get("/tasks", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined
        if(searchTerm === undefined){
            const result = await db("tasks")
            res.status(200).send(result)
        } else {
            const result = await db("tasks")
            .where("title", "LIKE", `%${searchTerm}%`)
            .orWhere("description", "LIKE", `%${searchTerm}%`)
            res.status(200).send(result)      
        }
          } catch (error) {
        console.log(error)
        if (req.statusCode === 200) {
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


app.post("/tasks", async (req: Request, res: Response) => {
    try {
       const {id, title, description} = req.body
      
        if(typeof id !== "string"){
            res.status(400)
            throw new Error("id deve ser string")
        }

        if(id.length < 4){
            res.status(400)
            throw new Error("id deve possuir pelo menos 4 caracteres")
        }
        if(typeof title !== "string"){
            res.status(400)
            throw new Error("Title deve ser string")
        }
        if(title.length < 10){
            res.status(400)
            throw new Error("O title deve possuir pelo menos 10 caracteres")
        }
        if(typeof description !== "string"){
            res.status(400)
            throw new Error("A descrição deve ser string")
        }
        if(description.length < 10){
            res.status(400)
            throw new Error("A descriçao deve possuir pelo menos 10 caracteres")
        }
        
        const [idAlreadyExtist]: TTasksDB[]  = await db("tasks").where({id})
        if(idAlreadyExtist){
            res.status(400)
            throw new Error("Id já existe")
        }

        const newTasks ={
            id,
            title,
            description,
            
        }

        await db("tasks").insert(newTasks)
        const [insertedTask] = await db("tasks").where({id})
        res.status(201).send({
            message: "Tasks criada com sucesso",
            task: newTasks
    })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

app.put("/tasks/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit = req.params.id

        // const {id, title, description, createdAt, status} = req.body
        const newId = req.body.id
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newCreatedAt = req.body.createdAt
        const newStatus = req.body.status

        if(newId !== undefined){
            if(typeof newId !== "string"){
                res.status(400)
                throw new Error("id deve ser string")
            }
            if(newId.length < 4){
                res.status(400)
                throw new Error("id deve possuir pelo menos 4 caracteres")
            }
        }
        
       if(newTitle !== undefined){
        if(typeof newTitle !== "string"){
            res.status(400)
            throw new Error("Title deve ser string")
        }
       }
       if(newDescription !== undefined){
        if(typeof newDescription !== "string"){
            res.status(400)
            throw new Error("A descrição deve ser string")
        }
        if(newDescription.length < 10){
            res.status(400)
            throw new Error("A descriçao deve possuir pelo menos 10 caracteres")
        }
       }
       if(newCreatedAt !== undefined){
        if (typeof newCreatedAt !== "string"){
            res.status(400)
            throw new Error ("CreatedAt deve ser string")
        }
       }
       if(newStatus !== undefined){
        if (typeof newStatus !== "number"){
            res.status(400)
            throw new Error ("status deve ser number (0 ou 1)")
        }
       }

        const [task]: TTasksDB[]  = await db("tasks").where({id: idToEdit})
        if(!task){
            res.status(400)
            throw new Error("Id não encontrado")
        }

        const newTasks: TTasksDB ={
            id: newId || task.id,
            title: newTitle || task.title,
            description: newDescription || task.description,
            created_at: newCreatedAt || task.created_at,
            status: isNaN(newStatus) ? task.status : newStatus
        }
        await db("tasks").update(newTasks).where({id: idToEdit})
        res.status(200).send({
            message: "Tasks editada com sucesso",
            task: newTasks
    })

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
