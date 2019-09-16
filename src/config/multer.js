//TODA A CONFIGURAÇÃO DA PARTE DE UPLOAD DE ARQUIVOS
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path'; 
// extname retorna qual extensão do arquivo
// resolve percorrer um caminho dentro da aplicação 

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..','..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
    /* randomBytes gera um nome aleatório de 16bytes para a imagem
     para que não fique imagens com o mesmo nome */
      crypto.randomBytes(16, (err, res) => { 
        if(err) return cb(err); // se tiver algum erro retorna o erro
    // se não retorna o n
        return cb(null, res.toString('hex') + extname(file.originalname));
    /* o null é passado como primeiro parametro p/ garantir que não tenha erro
    pois a função de callback recebe o erro como 1º parâmetro */
    /* o res.toString('hex');, está transformando 16bytes de conteudo aleatório
    em uma string hexadecimal*/
    // o extname é a extensão do arquivo, resultando em: 3h123k13kh.png
      });
    },
  }),
};