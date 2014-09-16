txtTemplate = File.open("txt.tpl.html","r").read()

File.open('index.tpl.html','r') do |template|
  File.open('index.html','w') do |output|
    filesList = "";
    filesListHtml = "";
    Dir.glob('./*') do |file|
      if (/(.*).txt$/.match (file))
        name = file.sub(/^.\//,"")
        
        txtContent = File.open(name,"r").read();
        
        htmlContent = txtTemplate.sub("{{content}}",txtContent)
        htmlContent.sub!("{{title}}",name)
        
        htmlName = name + ".html"
        
        File.open(htmlName,'w').write(htmlContent)
        
        filesList += "\t" + name + "\n\n"
        filesListHtml += "<a href='#{htmlName}'>#{name}</a><br>"
      end
    end
    
    output.write(template.read().gsub("{{files}}",filesListHtml))
  end
end
