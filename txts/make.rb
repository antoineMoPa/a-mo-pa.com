txtTemplate = File.open("txt.tpl.html","r").read()

@header = File.open("header.tpl.html","r").read()
@footer = File.open("footer.tpl.html","r").read()

def fillTemplate(template)
  template.sub!("{{header}}",@header)
  template.sub!("{{footer}}",@footer)

  return template
end

File.open('index.tpl.html','r') do |indexTemplate|
  File.open('index.html','w') do |indexFile|
    filesList = "";
    filesListHtml = "";
    Dir.glob('./txt/*') do |file|
      if (/(.*).txt$/.match (file))
        name = file.sub(/^.\/txt/,"")
        name.gsub!(/^\//,"")
        puts "./txt/#{name}"
        txtContent = File.open("txt/#{name}","r").read();
        
        htmlContent = txtTemplate.sub("{{content}}",txtContent)
        htmlContent.sub!("{{title}}",name)
        
        htmlContent = fillTemplate(htmlContent)
        
        htmlName = "./" + name + ".html"
        
        File.open(htmlName,'w').write(htmlContent)
        
        filesList += "\t" + name + "\n\n"
        filesListHtml += "<a href='#{htmlName}'>#{name}</a><br>"
      end
    end
    
    index = indexTemplate.read().gsub("{{files}}",filesListHtml)
    index = fillTemplate(index)
    
    indexFile.write(index)
  end
end
